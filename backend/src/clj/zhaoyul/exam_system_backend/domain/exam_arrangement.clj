(ns zhaoyul.exam-system-backend.domain.exam-arrangement
  "考场编排业务逻辑: 理论编排 + 技能编排 + 循环天数 + 打乱编排"
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]
   [zhaoyul.exam-system-backend.domain.resources :as resources]))

;; ============================================================
;; 编排流程状态
;; ============================================================
(def flow-states
  {:pending      "待编排"
   :theory       "理论编排中"
   :skill        "技能编排中"
   :arranged     "已编排"
   :confirmed    "已完成"})

;; ============================================================
;; Session types
;; ============================================================
(def session-types
  {:theory "理论"
   :skill  "技能"})

;; ============================================================
;; 获取认定计划列表（含编排状态）
;; ============================================================
(defn list-arrangement-plans
  [ds params]
  (let [result (resources/list-items ds "exam-arrangement" params)
        items (:items result)]
    (assoc result :items
           (mapv (fn [item]
                   (assoc item
                          :arrangementStatus (or (:arrangementStatus item) "待编排")
                          :theoryDone (boolean (:theoryDone item))
                          :skillDone (boolean (:skillDone item))))
                 items))))

;; ============================================================
;; 获取编排详情（包含考点、场次、考生分配等）
;; ============================================================
(defn get-arrangement-detail
  [ds plan-id]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)
        sessions (resources/list-items ds "exam-sessions" {"plan-id" plan-id :limit "200"})
        candidate-list (resources/list-items ds "candidates" {"limit" "500"})]
    (when plan
      {:plan plan
       :sessions (:items sessions)
       :candidates (:items candidate-list)})))

;; ============================================================
;; 场次管理
;; ============================================================
(defn get-plan-sessions
  [ds plan-id session-type]
  (let [all-sessions (resources/list-items ds "exam-sessions"
                                           {"plan-id" plan-id :limit "200"})
        sessions (:items all-sessions)]
    (if session-type
      {:sessions (filterv #(= session-type (:sessionType %)) sessions)}
      {:sessions sessions})))

(defn create-session!
  [ds {:keys [planId sessionType date startTime endTime roomId capacity]}]
  (let [time-range (str date " " startTime "~" endTime)
        session-data {:planId planId
                      :sessionType sessionType
                      :date date
                      :startTime startTime
                      :endTime endTime
                      :timeRange time-range
                      :roomId roomId
                      :capacity (or capacity 50)
                      :candidateCount 0
                      :status "scheduled"}
        result (resources/create-item! ds "exam-sessions"
                                       (merge {:name (str (get session-types (keyword sessionType) "考试")
                                                          "场次 " time-range)
                                               :status "active"}
                                              session-data))]
    result))

(defn update-session!
  [ds session-id updates]
  (let [current (resources/get-item ds "exam-sessions" session-id)]
    (when current
      (let [session-type (or (:sessionType updates) (:sessionType current))
            date (or (:date updates) (:date current))
            start (or (:startTime updates) (:startTime current))
            end   (or (:endTime updates) (:endTime current))
            time-range (str date " " start "~" end)]
        (resources/update-item! ds "exam-sessions" session-id
                                (merge updates {:timeRange time-range
                                                :name (str (get session-types (keyword session-type) "考试")
                                                           "场次 " time-range)}))))))

(defn delete-session!
  [ds session-id]
  (resources/delete-item! ds "exam-sessions" session-id))

;; ============================================================
;; 循环天数自动生成场次 (技能编排)
;; ============================================================
(defn generate-cycle-sessions!
  "根据循环天数自动生成多日期场次批次。
   Params: {:planId, :occupation, :startDate, :startTime, :endTime, :capacity, :cycleDays, :roomId}"
  [ds {:keys [planId occupation startDate startTime endTime capacity cycleDays roomId]}]
  (let [n (Integer/parseInt (str (or cycleDays "1")))
        sessions (for [day-offset (range n)]
                   (let [date-str (str startDate)  ;; TODO: date arithmetic for real production
                         time-range (str date-str " " startTime "~" endTime)]
                     {:planId planId
                      :sessionType "skill"
                      :occupation occupation
                      :date date-str
                      :startTime startTime
                      :endTime endTime
                      :timeRange time-range
                      :capacity (or capacity 50)
                      :candidateCount 0
                      :roomId roomId
                      :cycleDay (inc day-offset)
                      :cycleTotal n
                      :name (str "技能考核第" (inc day-offset) "批次 " time-range)
                      :status "scheduled"}))]
    (mapv (fn [s]
            (resources/create-item! ds "exam-sessions"
                                    (assoc s :status "active")))
          sessions)))

;; ============================================================
;; 考点/考场管理
;; ============================================================
(defn list-exam-sites
  [ds org-id]
  (let [result (resources/list-items ds "exam-rooms" {})]
    (if org-id
      (assoc result :items (filterv #(= org-id (:orgId %)) (:items result)))
      result)))

(defn add-site-to-plan!
  [ds plan-id site-id]
  (let [site (resources/get-item ds "exam-rooms" site-id)
        plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when (and site plan)
      (let [arrangement-sites (vec (or (:sites plan) []))]
        (if (some #(= (:id %) site-id) arrangement-sites)
          {:status :already-added :site site}
          (do
            (resources/update-item! ds "exam-arrangement" plan-id
                                    (assoc plan :sites (conj arrangement-sites
                                                             {:id (:id site)
                                                              :name (:name site)
                                                              :address (:address site)
                                                              :roomType (:roomType site)
                                                              :seatCount (:seatCount site)
                                                              :rooms []})))
            {:status :added :site site}))))))

(defn remove-site-from-plan!
  [ds plan-id site-id]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (let [arrangement-sites (vec (or (:sites plan) []))
            new-sites (filterv #(not= (:id %) site-id) arrangement-sites)]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan :sites new-sites))
        {:status :removed}))))

;; ============================================================
;; 考场管理 (在考点下)
;; ============================================================
(defn add-room-to-site!
  [ds plan-id site-id room-name seat-count]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (let [sites (vec (or (:sites plan) []))
            new-room {:id (db/uuid)
                      :name room-name
                      :totalSeats (Integer/parseInt (str seat-count))
                      :remainingSeats (Integer/parseInt (str seat-count))
                      :candidates 0}
            updated-sites (mapv (fn [s]
                                  (if (= (:id s) site-id)
                                    (update s :rooms conj new-room)
                                    s))
                                sites)]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan :sites updated-sites))
        {:status :added :room new-room}))))

(defn remove-room-from-site!
  [ds plan-id site-id room-id]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (let [sites (vec (or (:sites plan) []))
            updated-sites (mapv (fn [s]
                                  (if (= (:id s) site-id)
                                    (update s :rooms #(filterv (fn [r] (not= (:id r) room-id)) %))
                                    s))
                                sites)]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan :sites updated-sites))
        {:status :removed}))))

(defn add-seats-to-room!
  [ds plan-id site-id room-id additional-seats]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (let [sites (vec (or (:sites plan) []))
            add-n (Integer/parseInt (str additional-seats))
            updated-sites (mapv (fn [s]
                                  (if (= (:id s) site-id)
                                    (update s :rooms
                                            (fn [rooms]
                                              (mapv (fn [r]
                                                      (if (= (:id r) room-id)
                                                        (-> r
                                                            (update :totalSeats + add-n)
                                                            (update :remainingSeats + add-n))
                                                        r))
                                                    rooms)))
                                    s))
                                sites)]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan :sites updated-sites))
        {:status :seats-added :count add-n}))))

;; ============================================================
;; 考生分配
;; ============================================================
(defn assign-candidates-to-room!
  "将考生分配到指定考场。candidate-ids 是考生ID列表。"
  [ds plan-id site-id room-id candidate-ids]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (let [sites (vec (or (:sites plan) []))
            count-n (count candidate-ids)
            updated-sites (mapv (fn [s]
                                  (if (= (:id s) site-id)
                                    (update s :rooms
                                            (fn [rooms]
                                              (mapv (fn [r]
                                                      (if (= (:id r) room-id)
                                                        (-> r
                                                            (update :candidates + count-n)
                                                            (update :remainingSeats - count-n)
                                                            (update :assignedCandidateIds
                                                                    (fn [existing]
                                                                      (vec (distinct
                                                                            (concat (or existing [])
                                                                                    candidate-ids))))))
                                                        r))
                                                    rooms)))
                                    s))
                                sites)]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan :sites updated-sites))
        {:status :assigned :count count-n :candidateIds candidate-ids}))))

(defn unassign-candidates-from-room!
  [ds plan-id site-id room-id candidate-ids]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (let [sites (vec (or (:sites plan) []))
            remove-ids (set candidate-ids)
            remove-cnt (count remove-ids)
            updated-sites (mapv (fn [s]
                                  (if (= (:id s) site-id)
                                    (update s :rooms
                                            (fn [rooms]
                                              (mapv (fn [r]
                                                      (if (= (:id r) room-id)
                                                        (-> r
                                                            (update :candidates - remove-cnt)
                                                            (update :remainingSeats + remove-cnt)
                                                            (update :assignedCandidateIds
                                                                    (fn [existing]
                                                                      (vec (remove remove-ids (or existing []))))))
                                                        r))
                                                    rooms)))
                                    s))
                                sites)]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan :sites updated-sites))
        {:status :unassigned :count remove-cnt}))))

(defn cancel-all-assignments!
  [ds plan-id]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (let [sites (vec (or (:sites plan) []))
            cleared-sites (mapv (fn [s]
                                  (update s :rooms
                                          (fn [rooms]
                                            (mapv (fn [r]
                                                    (assoc r
                                                           :candidates 0
                                                           :remainingSeats (:totalSeats r)
                                                           :assignedCandidateIds []))
                                                  rooms))))
                                sites)]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan :sites cleared-sites))
        {:status :all-cancelled}))))

;; ============================================================
;; 打乱编排 (按工作单位打乱)
;; ============================================================
(defn shuffle-arrange!
  "打乱编排: 按工作单位(org/unit)打乱考生分配顺序。"
  [ds plan-id]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)
        candidates-result (resources/list-items ds "candidates" {"limit" "500"})
        candidates (:items candidates-result)]
    (when plan
      ;; 按工作单位分组，然后随机打乱组内顺序
      (let [grouped (group-by :org candidates)
            shuffled-groups (mapv (fn [[org cands]]
                                    {:org org
                                     :candidates (shuffle cands)
                                     :count (count cands)})
                                  grouped)
            ;; 将所有考生按打乱后的组拼接
            shuffled-candidates (mapcat :candidates shuffled-groups)]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan
                                       :arrangeMode "shuffle"
                                       :shuffleGroups (mapv (fn [g]
                                                               {:org (:org g)
                                                                :candidateIds (mapv :id (:candidates g))
                                                                :count (:count g)})
                                                             shuffled-groups)
                                       :shuffledCandidateIds (mapv :id shuffled-candidates)))
        {:status :shuffled
         :groups (mapv (fn [g]
                         {:org (:org g)
                          :candidateIds (mapv :id (:candidates g))
                          :count (:count g)})
                       shuffled-groups)
         :totalCandidates (count shuffled-candidates)}))))

;; ============================================================
;; 编排流程状态管理
;; ============================================================
(defn update-arrangement-status!
  [ds plan-id new-status]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (let [status-str (if (keyword? new-status)
                         (str (get flow-states new-status new-status))
                         (str new-status))]
        (resources/update-item! ds "exam-arrangement" plan-id
                                (assoc plan :status status-str :arrangementStatus status-str))
        {:status :updated :arrangementStatus status-str}))))

(defn mark-theory-done!
  [ds plan-id]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (resources/update-item! ds "exam-arrangement" plan-id
                              (assoc plan :theoryDone true :arrangementStatus "技能编排中"))
      {:status :theory-completed :arrangementStatus "技能编排中"})))

(defn mark-skill-done!
  [ds plan-id]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (resources/update-item! ds "exam-arrangement" plan-id
                              (assoc plan :skillDone true :arrangementStatus "已编排"))
      {:status :skill-completed :arrangementStatus "已编排"})))

(defn confirm-arrangement!
  [ds plan-id]
  (let [plan (resources/get-item ds "exam-arrangement" plan-id)]
    (when plan
      (resources/update-item! ds "exam-arrangement" plan-id
                              (assoc plan :arrangementStatus "已完成" :status "已完成"))
      {:status :confirmed :arrangementStatus "已完成"})))

;; ============================================================
;; 获取考生列表（按场次、计划筛选）
;; ============================================================
(defn list-candidates-for-arrangement
  [ds plan-id session-id]
  (let [all-candidates (resources/list-items ds "candidates" {"limit" "500"})
        plan (resources/get-item ds "exam-arrangement" plan-id)
        assigned-ids (when plan
                       (set (mapcat (fn [site]
                                      (mapcat (fn [room]
                                                (or (:assignedCandidateIds room) []))
                                              (:rooms site)))
                                    (or (:sites plan) []))))]
    {:candidates (mapv (fn [c]
                         (assoc c :isAssigned (contains? assigned-ids (:id c))))
                       (:items all-candidates))
     :assignedCount (count assigned-ids)
     :totalCount (count (:items all-candidates))}))
