(ns zhaoyul.exam-system-backend.domain.exam-staff-assignment
  "考务人员安排 — 督导/考务/监考/考评分配
   使用 cgn_exam_staff_assignment 表
   assignment_role: supervisor | exam_staff | invigilator | evaluator"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── row → camelCase ───

(defn- row->assignment [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :staffId (:staff_id row)
               :examRoomId (:exam_room_id row)
               :sessionId (:session_id row)
               :assignmentRole (:assignment_role row)
               :assignmentDate (:assignment_date row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_id :staff_id :exam_room_id :session_id
                :assignment_role :assignment_date :created_at :updated_at))))

;; ─── Rich assignment row (with staff details) ───

(defn- row->assignment-rich [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :staffId (:staff_id row)
               :staffName (:staff_name row)
               :staffPhone (:staff_phone row)
               :staffType (:staff_type row)
               :staffUnitName (:staff_unit_name row)
               :examRoomId (:exam_room_id row)
               :examRoomName (:exam_room_name row)
               :sessionId (:session_id row)
               :sessionName (:session_name row)
               :assignmentRole (:assignment_role row)
               :assignmentDate (:assignment_date row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_id :staff_id :staff_name :staff_phone :staff_type
                :staff_unit_name :exam_room_id :exam_room_name
                :session_id :session_name
                :assignment_role :assignment_date :created_at :updated_at))))

;; ─── Assignment CRUD ───

(defn list-assignments
  "List assignments with optional filters.
   Params map keys: planId, sessionId, examRoomId, assignmentRole, staffId, staffType"
  [ds {:keys [plan-id session-id exam-room-id assignment-role staff-id staff-type status]}]
  (let [filters (cond-> ["a.id IS NOT NULL"]
                  (seq plan-id) (conj "a.plan_id = ?")
                  (seq session-id) (conj "a.session_id = ?")
                  (seq exam-room-id) (conj "a.exam_room_id = ?")
                  (seq assignment-role) (conj "a.assignment_role = ?")
                  (seq staff-id) (conj "a.staff_id = ?")
                  (seq staff-type) (conj "s.staff_type = ?")
                  (seq status) (conj "a.status = ?"))
        args (cond-> []
               (seq plan-id) (conj plan-id)
               (seq session-id) (conj session-id)
               (seq exam-room-id) (conj exam-room-id)
               (seq assignment-role) (conj assignment-role)
               (seq staff-id) (conj staff-id)
               (seq staff-type) (conj staff-type)
               (seq status) (conj status))
        sql (str "SELECT a.*, s.name AS staff_name, s.phone AS staff_phone, "
                 "s.staff_type AS staff_type, s.unit_name AS staff_unit_name, "
                 "er.name AS exam_room_name, es.name AS session_name "
                 "FROM cgn_exam_staff_assignment a "
                 "LEFT JOIN cgn_exam_staff s ON a.staff_id = s.id "
                 "LEFT JOIN cgn_exam_room er ON a.exam_room_id = er.id "
                 "LEFT JOIN cgn_exam_session es ON a.session_id = es.id "
                 "WHERE " (str/join " AND " filters)
                 " ORDER BY a.updated_at DESC")]
    {:items (mapv row->assignment-rich (db/query ds (into [sql] args)))}))

(defn get-assignment [ds id]
  (let [sql (str "SELECT a.*, s.name AS staff_name, s.phone AS staff_phone, "
                 "s.staff_type AS staff_type, s.unit_name AS staff_unit_name, "
                 "er.name AS exam_room_name, es.name AS session_name "
                 "FROM cgn_exam_staff_assignment a "
                 "LEFT JOIN cgn_exam_staff s ON a.staff_id = s.id "
                 "LEFT JOIN cgn_exam_room er ON a.exam_room_id = er.id "
                 "LEFT JOIN cgn_exam_session es ON a.session_id = es.id "
                 "WHERE a.id = ?")]
    (row->assignment-rich (db/execute-one! ds [sql id]))))

(defn create-assignment! [ds body]
  (let [id (or (:id body) (db/uuid))
        plan-id (:planId body)
        staff-id (:staffId body)
        exam-room-id (:examRoomId body)
        session-id (:sessionId body)
        assignment-role (or (:assignmentRole body) "invigilator")
        assignment-date (or (:assignmentDate body) "")
        status (or (:status body) "assigned")
        org-id (or (:orgId body) (:org_id body) "")]
    (db/execute-one!
     ds
     ["INSERT INTO cgn_exam_staff_assignment
       (id, org_id, code, plan_id, staff_id, exam_room_id, session_id,
        assignment_role, assignment_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      id org-id (or (:code body) "")
      plan-id staff-id exam-room-id session-id
      assignment-role assignment-date status])
    (get-assignment ds id)))

(defn delete-assignment! [ds id]
  (when (db/execute-one! ds ["SELECT * FROM cgn_exam_staff_assignment WHERE id = ?" id])
    (db/execute! ds ["DELETE FROM cgn_exam_staff_assignment WHERE id = ?" id])
    true))

(defn delete-assignment-by-staff-role! [ds staff-id plan-id assignment-role]
  "Delete assignments matching staff + plan + role (for reassignment)."
  (db/execute!
   ds
   ["DELETE FROM cgn_exam_staff_assignment
     WHERE staff_id = ? AND plan_id = ? AND assignment_role = ?"
    staff-id plan-id assignment-role])
  true)

;; ─── Staff lookup helpers ───

(defn get-assignable-staff
  "Get staff of a given type, with their assignment status for a plan.
   Returns staff records with an extra :assigned field containing assignment details."
  [ds {:keys [staff-type plan-id assignment-role occupation]}]
  (let [filters (cond-> ["staff_type = ? AND s.status = 'active'"]
                  (seq occupation) (conj "EXISTS (SELECT 1 FROM cgn_plan_item pi WHERE pi.plan_id = ? AND pi.occupation = ?)"))
        args (cond-> [staff-type]
               (seq occupation) (into [plan-id occupation]))
        sql (str "SELECT s.*, "
                 "a.id AS assignment_id, a.status AS assignment_status, "
                 "a.exam_room_id AS assigned_room_id, a.session_id AS assigned_session_id, "
                 "er.name AS assigned_room_name, es.name AS assigned_session_name "
                 "FROM cgn_exam_staff s "
                 "LEFT JOIN cgn_exam_staff_assignment a "
                 " ON s.id = a.staff_id AND a.plan_id = ? AND a.assignment_role = ? AND a.status = 'assigned' "
                 "LEFT JOIN cgn_exam_room er ON a.exam_room_id = er.id "
                 "LEFT JOIN cgn_exam_session es ON a.session_id = es.id "
                 "WHERE " (str/join " AND " filters)
                 " ORDER BY a.status DESC, s.name ASC")]
    (let [full-args (into [sql] (into [plan-id (or assignment-role "invigilator")] args))]
      (mapv (fn [row]
              (-> row
                  (assoc :loginName (:login_name row)
                         :idCard (:id_card row)
                         :staffType (:staff_type row)
                         :unitName (:unit_name row)
                         :photoUrl (:photo_url row)
                         :assignmentId (:assignment_id row)
                         :assignmentStatus (:assignment_status row)
                         :assignedRoomId (:assigned_room_id row)
                         :assignedSessionId (:assigned_session_id row)
                         :assignedRoomName (:assigned_room_name row)
                         :assignedSessionName (:assigned_session_name row))
                  (dissoc :login_name :id_card :staff_type :unit_name :photo_url
                          :assignment_id :assignment_status
                          :assigned_room_id :assigned_session_id
                          :assigned_room_name :assigned_session_name)))
            (db/query ds full-args)))))

;; ─── Plan occupations (for evaluator filter) ───

(defn get-plan-occupations [ds plan-id]
  "Get distinct occupations from plan items for a given plan."
  (let [rows (db/query ds
               ["SELECT DISTINCT occupation FROM cgn_plan_item
                 WHERE plan_id = ? AND occupation IS NOT NULL AND occupation != ''
                 ORDER BY occupation"
                plan-id])]
    (mapv :occupation rows)))

;; ─── Plan sessions (for assignment context) ───

(defn get-plan-sessions [ds plan-id]
  (db/query ds
    ["SELECT * FROM cgn_exam_session WHERE plan_id = ? ORDER BY start_at"
     plan-id]))

;; ─── Plan exam rooms ───

(defn get-plan-exam-rooms [ds plan-id]
  (db/query ds
    ["SELECT * FROM cgn_exam_room WHERE status = 'active' ORDER BY name"]))

;; ─── Staff assignment history (for a specific staff member) ───

(defn get-staff-assignment-history [ds staff-id]
  (let [sql (str "SELECT a.*, "
                 "er.name AS exam_room_name, es.name AS session_name "
                 "FROM cgn_exam_staff_assignment a "
                 "LEFT JOIN cgn_exam_room er ON a.exam_room_id = er.id "
                 "LEFT JOIN cgn_exam_session es ON a.session_id = es.id "
                 "WHERE a.staff_id = ? "
                 "ORDER BY a.assignment_date DESC, a.created_at DESC")]
    (mapv row->assignment (db/query ds [sql staff-id]))))

;; ─── Batch assignment ───

(defn batch-assign!
  "Assign multiple staff to a plan/session/room at once.
   body: {:planId ... :sessionId ... :examRoomId ... :assignmentRole ... :staffIds [...] :assignmentDate ...}"
  [ds body]
  (let [plan-id (:planId body)
        session-id (:sessionId body)
        exam-room-id (:examRoomId body)
        assignment-role (:assignmentRole body)
        assignment-date (or (:assignmentDate body) "")
        staff-ids (:staffIds body)
        org-id (or (:orgId body) "")]
    (doseq [staff-id staff-ids]
      ;; Delete existing assignment for this staff+plan+role
      (delete-assignment-by-staff-role! ds staff-id plan-id assignment-role)
      ;; Create new assignment
      (create-assignment! ds
                          {:id (db/uuid)
                           :orgId org-id
                           :code (str "SA-" plan-id "-" staff-id "-" assignment-role)
                           :planId plan-id
                           :staffId staff-id
                           :sessionId session-id
                           :examRoomId exam-room-id
                           :assignmentRole assignment-role
                           :assignmentDate assignment-date
                           :status "assigned"})))
  {:success true
   :assignedCount (count staff-ids)})
