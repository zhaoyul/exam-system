(ns zhaoyul.exam-system-backend.domain.exam-arrangement
  "考场编排 — 理论编排 + 技能编排 + 循环天数 + 打乱编排"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ─── Row transforms ───

(defn- row->plan [row]
  (when row
    (-> row
        (assoc :planNo (:plan_no row)
               :planName (:plan_name row)
               :examMonth (:exam_month row)
               :siteName (:site_name row)
               :regCount (:reg_count row)
               :status (:status row)
               :phase (:phase row)
               :theoryDone (:theory_done row)
               :skillDone (:skill_done row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_no :plan_name :exam_month :site_name :reg_count :phase :theory_done :skill_done :created_at :updated_at))))

(defn- row->session [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :sessionDate (:session_date row)
               :startTime (:start_time row)
               :endTime (:end_time row)
               :sessionType (:session_type row)
               :profession (:profession row)
               :level (:level row)
               :capacity (:capacity row)
               :cycleStartDate (:cycle_start_date row)
               :cycleDays (:cycle_days row)
               :isCycle (:is_cycle row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_id :session_date :start_time :end_time :session_type :cycle_start_date :cycle_days :is_cycle :created_at :updated_at))))

(defn- row->site [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :siteType (:site_type row)
               :totalRooms (:total_rooms row)
               :candidateCount (:candidate_count row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :plan_id :site_type :total_rooms :candidate_count :created_at :updated_at))))

(defn- row->room [row]
  (when row
    (-> row
        (assoc :siteId (:site_id row)
               :totalSeats (:total_seats row)
               :remainingSeats (:remaining_seats row)
               :candidates (:candidates row)
               :createdAt (:created_at row)
               :updatedAt (:updated_at row))
        (dissoc :site_id :total_seats :remaining_seats :created_at :updated_at))))

(defn- row->assignment [row]
  (when row
    (-> row
        (assoc :planId (:plan_id row)
               :sessionId (:session_id row)
               :siteId (:site_id row)
               :roomId (:room_id row)
               :candidateId (:candidate_id row)
               :candidateName (:candidate_name row)
               :idCard (:id_card row)
               :profession (:profession row)
               :level (:level row)
               :workUnit (:work_unit row)
               :seatNumber (:seat_number row)
               :assignType (:assign_type row)
               :createdAt (:created_at row))
        (dissoc :plan_id :session_id :site_id :room_id :candidate_id :candidate_name :id_card :work_unit :seat_number :assign_type :created_at))))

;; ─── Arrangement Plans ───

(defn list-arrangement-plans [ds {:keys [status q]}]
  (let [filters (cond-> ["1 = 1"]
                  (seq q) (conj "(p.name LIKE ? OR p.code LIKE ?)")
                  (seq status) (conj "a.status = ?"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%")])
               (seq status) (conj status))
        sql (str "SELECT p.id, p.code as plan_no, p.name as plan_name, "
                 "p.exam_month, '' as site_name, "
                 "(SELECT COUNT(*) FROM cgn_candidate_reg cr WHERE cr.plan_id = p.id AND cr.status != 'cancelled') as reg_count, "
                 "COALESCE(a.status, 'pending') as status, "
                 "COALESCE(a.phase, 'theory') as phase, "
                 "COALESCE(a.theory_done, 0) as theory_done, "
                 "COALESCE(a.skill_done, 0) as skill_done, "
                 "p.created_at "
                 "FROM cgn_recog_plan p "
                 "LEFT JOIN exam_arrangements a ON a.plan_id = p.id "
                 "WHERE " (str/join " AND " filters)
                 " ORDER BY p.created_at DESC")]
    {:items (mapv row->plan (db/query ds (into [sql] args)))}))

(defn ensure-arrangement! [ds plan-id]
  (let [existing (db/execute-one! ds ["SELECT * FROM exam_arrangements WHERE plan_id = ?" plan-id])]
    (when-not existing
      (let [id (db/uuid)]
        (db/execute! ds ["INSERT INTO exam_arrangements (id, plan_id, status, phase, theory_done, skill_done) VALUES (?, ?, 'pending', 'theory', 0, 0)" id plan-id])))
    (db/execute-one! ds ["SELECT * FROM exam_arrangements WHERE plan_id = ?" plan-id])))

(defn get-arrangement-plan [ds plan-id]
  (let [plan (db/execute-one! ds
               ["SELECT p.id, p.code as plan_no, p.name as plan_name, p.exam_month, '' as site_name, "
                "(SELECT COUNT(*) FROM cgn_candidate_reg cr WHERE cr.plan_id = p.id AND cr.status != 'cancelled') as reg_count, "
                "COALESCE(a.status, 'pending') as status, "
                "COALESCE(a.phase, 'theory') as phase, "
                "COALESCE(a.theory_done, 0) as theory_done, "
                "COALESCE(a.skill_done, 0) as skill_done, "
                "p.created_at "
                "FROM cgn_recog_plan p "
                "LEFT JOIN exam_arrangements a ON a.plan_id = p.id "
                "WHERE p.id = ?" plan-id])]
    (when plan
      (let [sessions (mapv row->session (db/query ds ["SELECT * FROM exam_sessions WHERE plan_id = ? ORDER BY session_date, start_time" plan-id]))
            sites (mapv row->site (db/query ds ["SELECT * FROM exam_sites WHERE plan_id = ? ORDER BY created_at" plan-id]))
            site-ids (mapv :id sites)
            rooms (if (seq site-ids)
                    (mapv row->room (db/query ds [(str "SELECT * FROM exam_rooms WHERE site_id IN ("
                                                        (str/join "," (repeat (count site-ids) "?")) ")")
                                                   (into [] site-ids)]))
                    [])
            assignments (mapv row->assignment (db/query ds ["SELECT * FROM exam_assignments WHERE plan_id = ? ORDER BY created_at" plan-id]))]
        (merge (row->plan plan)
               {:sessions sessions
                :sites sites
                :rooms rooms
                :assignments assignments})))))

;; ─── Theory Sessions ───

(defn list-theory-sessions [ds plan-id]
  {:items (mapv row->session
                (db/query ds ["SELECT * FROM exam_sessions WHERE plan_id = ? AND session_type = 'theory' ORDER BY session_date, start_time" plan-id]))})

(defn create-theory-session! [ds plan-id body]
  (ensure-arrangement! ds plan-id)
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO exam_sessions (id, plan_id, session_type, session_date, start_time, end_time, profession, level, capacity, is_cycle)
        VALUES (?, ?, 'theory', ?, ?, ?, ?, ?, ?, 0)"
       id plan-id (:sessionDate body) (:startTime body) (:endTime body)
       (or (:profession body) "") (or (:level body) "") (or (:capacity body) 0)])
    (row->session (db/execute-one! ds ["SELECT * FROM exam_sessions WHERE id = ?" id]))))

(defn delete-theory-session! [ds session-id]
  (when (db/execute-one! ds ["SELECT * FROM exam_sessions WHERE id = ? AND session_type = 'theory'" session-id])
    (db/execute! ds ["DELETE FROM exam_assignments WHERE session_id = ?" session-id])
    (db/execute! ds ["DELETE FROM exam_sessions WHERE id = ?" session-id])
    true))

;; ─── Theory Sites ───

(defn list-theory-sites [ds plan-id]
  (let [sites (mapv row->site (db/query ds ["SELECT * FROM exam_sites WHERE plan_id = ? AND site_type = 'theory' ORDER BY created_at" plan-id]))]
    (mapv (fn [site]
            (let [rooms (mapv row->room (db/query ds ["SELECT * FROM exam_rooms WHERE site_id = ? ORDER BY created_at" (:id site)]))]
              (assoc site :rooms rooms)))
          sites)))

(defn add-theory-site! [ds plan-id body]
  (ensure-arrangement! ds plan-id)
  (let [id (or (:id body) (db/uuid))]
    (db/execute! ds
      ["INSERT INTO exam_sites (id, plan_id, name, site_type, total_rooms, candidate_count)
        VALUES (?, ?, ?, 'theory', 0, 0)"
       id plan-id (:name body)])
    (row->site (db/execute-one! ds ["SELECT * FROM exam_sites WHERE id = ?" id]))))

(defn remove-theory-site! [ds site-id]
  (when (db/execute-one! ds ["SELECT * FROM exam_sites WHERE id = ? AND site_type = 'theory'" site-id])
    (db/execute! ds ["DELETE FROM exam_assignments WHERE site_id = ?" site-id])
    (db/execute! ds ["DELETE FROM exam_rooms WHERE site_id = ?" site-id])
    (db/execute! ds ["DELETE FROM exam_sites WHERE id = ?" site-id])
    true))

;; ─── Theory Rooms ───

(defn add-theory-room! [ds site-id body]
  (let [site (db/execute-one! ds ["SELECT * FROM exam_sites WHERE id = ?" site-id])
        id (or (:id body) (db/uuid))
        seats (or (:totalSeats body) 50)]
    (when site
      (db/execute! ds
        ["INSERT INTO exam_rooms (id, site_id, plan_id, name, total_seats, remaining_seats, candidates)
          VALUES (?, ?, ?, ?, ?, ?, 0)"
         id site-id (:plan_id site) (:name body) seats seats])
      (db/execute! ds ["UPDATE exam_sites SET total_rooms = total_rooms + 1 WHERE id = ?" site-id])
      (row->room (db/execute-one! ds ["SELECT * FROM exam_rooms WHERE id = ?" id])))))

(defn add-room-seats! [ds room-id {:keys [additionalSeats]}]
  (let [room (db/execute-one! ds ["SELECT * FROM exam_rooms WHERE id = ?" room-id])
        add-seats (or additionalSeats 10)]
    (when room
      (db/execute! ds ["UPDATE exam_rooms SET total_seats = total_seats + ?, remaining_seats = remaining_seats + ? WHERE id = ?"
                       add-seats add-seats room-id])
      (row->room (db/execute-one! ds ["SELECT * FROM exam_rooms WHERE id = ?" room-id])))))

(defn delete-room! [ds room-id]
  (when-let [room (db/execute-one! ds ["SELECT * FROM exam_rooms WHERE id = ?" room-id])]
    (db/execute! ds ["DELETE FROM exam_assignments WHERE room_id = ?" room-id])
    (db/execute! ds ["DELETE FROM exam_rooms WHERE id = ?" room-id])
    (db/execute! ds ["UPDATE exam_sites SET total_rooms = MAX(0, total_rooms - 1) WHERE id = ?" (:site_id room)])
    true))

;; ─── Candidate Assignments ───

(defn list-unassigned-candidates [ds plan-id]
  "List candidates registered for the plan but not yet assigned to any room"
  (let [sql "SELECT cr.candidate_id as id, c.name, c.id_card as idCard,
                  c.profession, c.level, c.work_unit as workUnit,
                  cr.batch_id as batchId
             FROM cgn_candidate_reg cr
             JOIN cgn_candidate c ON c.id = cr.candidate_id
             WHERE cr.plan_id = ? AND cr.status != 'cancelled'
               AND cr.candidate_id NOT IN (
                 SELECT candidate_id FROM exam_assignments WHERE plan_id = ?
               )
             ORDER BY c.work_unit, c.name"]
    {:items (db/query ds (into [sql] [plan-id plan-id]))}))

(defn list-assigned-candidates [ds {:keys [plan-id room-id session-id]}]
  (let [filters (cond-> ["plan_id = ?"]
                  room-id (conj "room_id = ?")
                  session-id (conj "session_id = ?"))
        args (cond-> [plan-id]
               room-id (conj room-id)
               session-id (conj session-id))
        sql (str "SELECT * FROM exam_assignments WHERE " (str/join " AND " filters) " ORDER BY seat_number")]
    {:items (mapv row->assignment (db/query ds (into [sql] args)))}))

(defn assign-candidates! [ds plan-id body]
  "Assign candidates to a room/session. body: {:candidateIds [...] :roomId :sessionId}"
  (let [{:keys [candidateIds roomId sessionId]} body
        room (db/execute-one! ds ["SELECT * FROM exam_rooms WHERE id = ?" roomId])
        assigned-count (if (seq candidateIds) (count candidateIds) 0)]
    (when room
      (doseq [cand-id candidateIds]
        (let [cand (db/execute-one! ds ["SELECT * FROM cgn_candidate WHERE id = ?" cand-id])
              assign-id (db/uuid)
              seat (db/execute-one! ds ["SELECT COALESCE(MAX(seat_number), 0) + 1 as next_seat FROM exam_assignments WHERE room_id = ?" roomId])]
          (db/execute! ds
            ["INSERT INTO exam_assignments (id, plan_id, session_id, site_id, room_id, candidate_id,
               candidate_name, id_card, profession, level, work_unit, seat_number, assign_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual')"
             assign-id plan-id sessionId (:site_id room) roomId cand-id
             (:name cand) (:id_card cand) (:profession cand) (:level cand) (:work_unit cand)
             (:next_seat seat)])))
      (db/execute! ds
        ["UPDATE exam_rooms SET candidates = candidates + ?, remaining_seats = MAX(0, remaining_seats - ?) WHERE id = ?"
         assigned-count assigned-count roomId])
      (db/execute! ds
        ["UPDATE exam_sites SET candidate_count = candidate_count + ? WHERE id = ?"
         assigned-count (:site_id room)])
      {:assigned assigned-count :roomId roomId :sessionId sessionId})))

(defn cancel-assignment! [ds assignment-id]
  (when-let [assignment (db/execute-one! ds ["SELECT * FROM exam_assignments WHERE id = ?" assignment-id])]
    (db/execute! ds ["DELETE FROM exam_assignments WHERE id = ?" assignment-id])
    (db/execute! ds ["UPDATE exam_rooms SET candidates = MAX(0, candidates - 1), remaining_seats = remaining_seats + 1 WHERE id = ?" (:room_id assignment)])
    (db/execute! ds ["UPDATE exam_sites SET candidate_count = MAX(0, candidate_count - 1) WHERE id = ?" (:site_id assignment)])
    true))

(defn cancel-all-assignments! [ds plan-id]
  (db/execute! ds ["DELETE FROM exam_assignments WHERE plan_id = ?" plan-id])
  (db/execute! ds ["UPDATE exam_rooms SET candidates = 0, remaining_seats = total_seats WHERE plan_id = ?" plan-id])
  (db/execute! ds ["UPDATE exam_sites SET candidate_count = 0 WHERE plan_id = ?" plan-id])
  {:cancelled true})

;; ─── Auto Arrange (Normal / Shuffle) ───

(defn auto-arrange! [ds plan-id {:keys [mode sessionId]}]
  "Auto arrange candidates. mode: 'normal' or 'shuffle' (shuffle by work unit)"
  (let [mode (or mode "normal")
        candidates-raw (db/query ds
                         ["SELECT cr.candidate_id as id, c.name, c.id_card, c.profession, c.level, c.work_unit
                           FROM cgn_candidate_reg cr
                           JOIN cgn_candidate c ON c.id = cr.candidate_id
                           WHERE cr.plan_id = ? AND cr.status != 'cancelled'
                             AND cr.candidate_id NOT IN (
                               SELECT candidate_id FROM exam_assignments WHERE plan_id = ?
                             )
                           ORDER BY c.work_unit, c.name"
                          plan-id plan-id])
        candidates (if (= mode "shuffle")
                     (shuffle candidates-raw)
                     candidates-raw)
        rooms (db/query ds
                ["SELECT er.* FROM exam_rooms er
                  JOIN exam_sites es ON es.id = er.site_id
                  WHERE er.plan_id = ? AND er.remaining_seats > 0
                  ORDER BY er.remaining_seats DESC"
                 plan-id])
        assignments (loop [remaining candidates
                           rooms rooms
                           acc []]
                      (if (or (empty? remaining) (empty? rooms))
                        acc
                        (let [room (first rooms)
                              room-id (:id room)
                              site-id (:site_id room)
                              rem-seats (:remaining_seats room)
                              to-assign (min (count remaining) rem-seats)
                              batch (take to-assign remaining)
                              rest-cands (drop to-assign remaining)
                              remaining-rooms (if (<= to-assign rem-seats)
                                                (if (> rem-seats to-assign)
                                                  (conj (vec (rest rooms))
                                                        (update room :remaining_seats - to-assign))
                                                  (vec (rest rooms)))
                                                (vec (rest rooms)))]
                          (doseq [cand batch]
                            (let [assign-id (db/uuid)
                                  seat (db/execute-one! ds
                                         ["SELECT COALESCE(MAX(seat_number), 0) + 1 as next_seat
                                           FROM exam_assignments WHERE room_id = ?" room-id])]
                              (db/execute! ds
                                ["INSERT INTO exam_assignments (id, plan_id, session_id, site_id, room_id, candidate_id,
                                   candidate_name, id_card, profession, level, work_unit, seat_number, assign_type)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'auto')"
                                 assign-id plan-id (or sessionId "") site-id room-id (:id cand)
                                 (:name cand) (:id_card cand) (:profession cand) (:level cand) (:work_unit cand)
                                 (:next_seat seat)])))
                          (let [assigned-count (count batch)]
                            (db/execute! ds
                              ["UPDATE exam_rooms SET candidates = candidates + ?, remaining_seats = MAX(0, remaining_seats - ?) WHERE id = ?"
                               assigned-count assigned-count room-id])
                            (db/execute! ds
                              ["UPDATE exam_sites SET candidate_count = candidate_count + ? WHERE id = ?"
                               assigned-count site-id]))
                          (recur rest-cands remaining-rooms (conj acc {:roomId room-id :assigned (count batch)})))))]
    {:mode mode :assignments assignments :totalAssigned (reduce + 0 (map :assigned assignments))}))

;; ─── Skill Sessions (with cycle days) ───

(defn copy-theory-sites-to-skill! [ds plan-id]
  "Copy theory sites and rooms to skill sites"
  (let [theory-sites (db/query ds ["SELECT * FROM exam_sites WHERE plan_id = ? AND site_type = 'theory'" plan-id])
        existing-skill (db/execute-one! ds ["SELECT COUNT(*) as cnt FROM exam_sites WHERE plan_id = ? AND site_type = 'skill'" plan-id])]
    (when (and (seq theory-sites) (zero? (:cnt existing-skill)))
      (doseq [site theory-sites]
        (let [skill-site-id (db/uuid)]
          (db/execute! ds
            ["INSERT INTO exam_sites (id, plan_id, name, site_type, total_rooms, candidate_count)
              VALUES (?, ?, ?, 'skill', 0, 0)"
             skill-site-id plan-id (:name site)])
          (let [rooms (db/query ds ["SELECT * FROM exam_rooms WHERE site_id = ?" (:id site)])]
            (doseq [room rooms]
              (db/execute! ds
                ["INSERT INTO exam_rooms (id, site_id, plan_id, name, total_seats, remaining_seats, candidates)
                  VALUES (?, ?, ?, ?, ?, ?, 0)"
                 (db/uuid) skill-site-id plan-id (:name room) (:total_seats room) (:total_seats room)]))
            (db/execute! ds ["UPDATE exam_sites SET total_rooms = ? WHERE id = ?" (count rooms) skill-site-id])))))
    {:copied true}))

(defn create-skill-cycle-sessions! [ds plan-id body]
  "Create skill sessions with cycle days.
   body: {:profession :level :startDate :startTime :endTime :capacity :cycleDays}"
  (ensure-arrangement! ds plan-id)
  (copy-theory-sites-to-skill! ds plan-id)
  (let [{:keys [profession level startDate startTime endTime capacity cycleDays]} body
        days (or (parse-long (str cycleDays)) 1)]
    (for [d (range days)]
      (let [id (db/uuid)
            session-date (str startDate)] ;; In a real system, this would add 'd' days to startDate
        (db/execute! ds
          ["INSERT INTO exam_sessions (id, plan_id, session_type, session_date, start_time, end_time, profession, level, capacity, cycle_start_date, cycle_days, is_cycle)
            VALUES (?, ?, 'skill', ?, ?, ?, ?, ?, ?, ?, ?, 1)"
           id plan-id session-date startTime endTime profession level (or capacity 0) startDate days])
        (row->session (db/execute-one! ds ["SELECT * FROM exam_sessions WHERE id = ?" id]))))))

(defn list-skill-sessions [ds plan-id]
  {:items (mapv row->session
                (db/query ds ["SELECT * FROM exam_sessions WHERE plan_id = ? AND session_type = 'skill' ORDER BY session_date, start_time" plan-id]))})

(defn list-skill-sites [ds plan-id]
  (let [sites (mapv row->site (db/query ds ["SELECT * FROM exam_sites WHERE plan_id = ? AND site_type = 'skill' ORDER BY created_at" plan-id]))]
    (mapv (fn [site]
            (let [rooms (mapv row->room (db/query ds ["SELECT * FROM exam_rooms WHERE site_id = ? ORDER BY created_at" (:id site)]))]
              (assoc site :rooms rooms)))
          sites)))

;; ─── Phase Transition ───

(defn advance-to-skill-phase! [ds plan-id]
  (ensure-arrangement! ds plan-id)
  (copy-theory-sites-to-skill! ds plan-id)
  (db/execute! ds ["UPDATE exam_arrangements SET phase = 'skill', theory_done = 1, status = 'arranging' WHERE plan_id = ?" plan-id])
  {:phase "skill"})

(defn complete-arrangement! [ds plan-id]
  (ensure-arrangement! ds plan-id)
  (db/execute! ds ["UPDATE exam_arrangements SET status = 'completed', skill_done = 1, phase = 'done' WHERE plan_id = ?" plan-id])
  {:status "completed"})

;; ─── Ensure tables ───

(defn ensure-tables! [ds]
  (doseq [sql [;; Arrangement status per plan
               "CREATE TABLE IF NOT EXISTS exam_arrangements (
                  id VARCHAR(64) PRIMARY KEY,
                  plan_id VARCHAR(64) NOT NULL,
                  status VARCHAR(32) DEFAULT 'pending',
                  phase VARCHAR(32) DEFAULT 'theory',
                  theory_done INTEGER DEFAULT 0,
                  skill_done INTEGER DEFAULT 0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE(plan_id)
                )"
               ;; Exam sessions (theory + skill)
               "CREATE TABLE IF NOT EXISTS exam_sessions (
                  id VARCHAR(64) PRIMARY KEY,
                  plan_id VARCHAR(64) NOT NULL,
                  session_type VARCHAR(32) NOT NULL DEFAULT 'theory',
                  session_date VARCHAR(32),
                  start_time VARCHAR(16),
                  end_time VARCHAR(16),
                  profession VARCHAR(128),
                  level VARCHAR(128),
                  capacity INTEGER DEFAULT 0,
                  cycle_start_date VARCHAR(32),
                  cycle_days INTEGER DEFAULT 0,
                  is_cycle INTEGER DEFAULT 0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )"
               ;; Exam sites assigned to plan
               "CREATE TABLE IF NOT EXISTS exam_sites (
                  id VARCHAR(64) PRIMARY KEY,
                  plan_id VARCHAR(64) NOT NULL,
                  name VARCHAR(255) NOT NULL,
                  site_type VARCHAR(32) DEFAULT 'theory',
                  total_rooms INTEGER DEFAULT 0,
                  candidate_count INTEGER DEFAULT 0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )"
               ;; Exam rooms within a site
               "CREATE TABLE IF NOT EXISTS exam_rooms (
                  id VARCHAR(64) PRIMARY KEY,
                  site_id VARCHAR(64) NOT NULL,
                  plan_id VARCHAR(64) NOT NULL,
                  name VARCHAR(255) NOT NULL,
                  total_seats INTEGER DEFAULT 50,
                  remaining_seats INTEGER DEFAULT 50,
                  candidates INTEGER DEFAULT 0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )"
               ;; Candidate assignments to rooms
               "CREATE TABLE IF NOT EXISTS exam_assignments (
                  id VARCHAR(64) PRIMARY KEY,
                  plan_id VARCHAR(64) NOT NULL,
                  session_id VARCHAR(64),
                  site_id VARCHAR(64),
                  room_id VARCHAR(64),
                  candidate_id VARCHAR(64) NOT NULL,
                  candidate_name VARCHAR(128),
                  id_card VARCHAR(32),
                  profession VARCHAR(128),
                  level VARCHAR(128),
                  work_unit VARCHAR(255),
                  seat_number INTEGER DEFAULT 1,
                  assign_type VARCHAR(32) DEFAULT 'manual',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )"]]
    (try
      (db/execute! ds [sql])
      (catch Exception _ nil)))
  {:tables_ensured true})
