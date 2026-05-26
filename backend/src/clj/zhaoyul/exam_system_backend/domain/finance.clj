(ns zhaoyul.exam-system-backend.domain.finance
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

(defn- query-param [params key]
  (or (get params key) (get params (keyword key))))

(defn- level-key [level]
  (cond
    (or (= level "一级") (str/includes? (str level) "一级")) :level1
    (or (= level "二级") (str/includes? (str level) "二级")) :level2
    (or (= level "三级") (str/includes? (str level) "三级")) :level3
    (or (= level "四级") (str/includes? (str level) "四级")) :level4
    (or (= level "五级") (str/includes? (str level) "五级")) :level5
    :else :level3))

(defn- row->standard [row]
  {:id (:id row)
   :professionCode (:profession_code row)
   :professionName (:profession_name row)
   :level1 (or (:level1 row) 0)
   :level2 (or (:level2 row) 0)
   :level3 (or (:level3 row) 0)
   :level4 (or (:level4 row) 0)
   :level5 (or (:level5 row) 0)
   :status (:status row)
   :createdAt (:created_at row)
   :updatedAt (:updated_at row)})

(def default-standards
  [{:professionCode "6-28-01-01" :professionName "核反应堆运行值班员" :level1 600 :level2 500 :level3 400 :level4 300 :level5 200}
   {:professionCode "6-31-01-01" :professionName "电气试验员" :level1 500 :level2 400 :level3 300 :level4 200 :level5 150}
   {:professionCode "6-31-01-03" :professionName "机械设备检修工" :level1 500 :level2 400 :level3 300 :level4 200 :level5 150}
   {:professionCode "6-31-01-05" :professionName "仪控设备检修工" :level1 500 :level2 400 :level3 300 :level4 200 :level5 150}
   {:professionCode "6-18-01-01" :professionName "焊接工" :level1 400 :level2 350 :level3 300 :level4 200 :level5 150}])

(defn ensure-default-standards! [ds]
  (doseq [item default-standards
          :when (nil? (db/execute-one! ds ["SELECT id FROM cgn_fee_standard WHERE profession_name = ?"
                                           (:professionName item)]))]
    (db/execute! ds
                 ["INSERT INTO cgn_fee_standard
                   (id, profession_code, profession_name, level1, level2, level3, level4, level5, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')"
                  (db/uuid) (:professionCode item) (:professionName item) (:level1 item) (:level2 item)
                  (:level3 item) (:level4 item) (:level5 item)])))

(defn list-standards [ds params]
  (ensure-default-standards! ds)
  (let [q (some-> (query-param params "q") str/trim)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(profession_name LIKE ? OR profession_code LIKE ?)"))
        args (cond-> []
               (seq q) (into [(str "%" q "%") (str "%" q "%")]))
        sql (str "SELECT * FROM cgn_fee_standard WHERE " (str/join " AND " filters) " ORDER BY profession_code, profession_name")]
    {:items (mapv row->standard (db/query ds (into [sql] args)))}))

(defn get-standard [ds id]
  (row->standard (db/execute-one! ds ["SELECT * FROM cgn_fee_standard WHERE id = ?" id])))

(defn save-standard! [ds id body]
  (let [current (when id (db/execute-one! ds ["SELECT * FROM cgn_fee_standard WHERE id = ?" id]))
        new-id (or id (db/uuid))
        value #(double (or (% body) (% current) 0))]
    (if current
      (db/execute! ds
                   ["UPDATE cgn_fee_standard
                     SET profession_code = ?, profession_name = ?, level1 = ?, level2 = ?, level3 = ?, level4 = ?, level5 = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?"
                    (or (:professionCode body) (:profession_code current))
                    (or (:professionName body) (:profession_name current))
                    (value :level1) (value :level2) (value :level3) (value :level4) (value :level5)
                    id])
      (db/execute! ds
                   ["INSERT INTO cgn_fee_standard
                     (id, profession_code, profession_name, level1, level2, level3, level4, level5, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')"
                    new-id (:professionCode body) (:professionName body)
                    (value :level1) (value :level2) (value :level3) (value :level4) (value :level5)]))
    (get-standard ds new-id)))

(defn- amount-for [standard level]
  (double (or ((level-key level) standard) 0)))

(defn- standard-for [standards occupation]
  (or (first (filter #(= occupation (:professionName %)) standards))
      (first (filter #(str/includes? (str occupation) (:professionName %)) standards))
      (first (filter #(str/includes? (:professionName %) (str occupation)) standards))))

(defn ensure-charges! [ds]
  (ensure-default-standards! ds)
  (let [standards (:items (list-standards ds {}))
        regs (db/query ds ["SELECT r.id AS reg_id, r.org_id, r.plan_id, r.candidate_id, r.created_at,
                                   ca.occupation, ca.level
                              FROM cgn_candidate_reg r
                              INNER JOIN cgn_candidate ca ON ca.id = r.candidate_id
                             WHERE r.status != 'cancelled'"])]
    (doseq [reg regs
            :when (nil? (db/execute-one! ds ["SELECT id FROM cgn_fee_charge WHERE plan_id = ? AND candidate_id = ?"
                                             (:plan_id reg) (:candidate_id reg)]))]
      (let [standard (standard-for standards (:occupation reg))
            amount (amount-for standard (:level reg))]
        (db/execute! ds
                     ["INSERT INTO cgn_fee_charge (id, org_id, plan_id, candidate_id, batch_no, amount, status)
                       VALUES (?, ?, ?, ?, ?, ?, 'unpaid')"
                      (db/uuid) (or (:org_id reg) "") (:plan_id reg) (:candidate_id reg)
                      (str "B-" (subs (str (:plan_id reg)) 0 (min 8 (count (str (:plan_id reg)))))) amount])))))

(defn- row->charge [row]
  {:id (:id row)
   :batchNo (:batch_no row)
   :chargeNo (str "F-" (subs (:id row) 0 (min 8 (count (:id row)))))
   :candidateName (:candidate_name row)
   :idCard (:id_card row)
   :profession (:occupation row)
   :level (:level row)
   :planName (:plan_name row)
   :site (or (:site row) (:org_id row) "未归属")
   :amount (or (:amount row) 0)
   :status (:status row)
   :payDate (:pay_date row)
   :payMethod (:pay_method row)
   :createDate (or (:pay_date row) (some-> (:created_at row) (subs 0 10)) "")
   :createdAt (:created_at row)
   :updatedAt (:updated_at row)})

(defn list-charges [ds params]
  (ensure-charges! ds)
  (let [q (some-> (query-param params "q") str/trim)
        status (some-> (query-param params "status") str/trim)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(ca.name LIKE ? OR ca.id_card LIKE ? OR p.name LIKE ?)")
                  (seq status) (conj "fc.status = ?"))
        args (cond-> []
               (seq q) (into (repeat 3 (str "%" q "%")))
               (seq status) (conj status))
        sql (str "SELECT fc.*, ca.name AS candidate_name, ca.id_card, ca.occupation, ca.level,"
                 " p.name AS plan_name, COALESCE(ro.name, ca.org_name, fc.org_id) AS site"
                 " FROM cgn_fee_charge fc"
                 " INNER JOIN cgn_candidate ca ON ca.id = fc.candidate_id"
                 " LEFT JOIN cgn_recog_plan p ON p.id = fc.plan_id"
                 " LEFT JOIN cgn_recog_org ro ON ro.id = p.org_id"
                 " WHERE " (str/join " AND " filters)
                 " ORDER BY fc.updated_at DESC, fc.created_at DESC")]
    {:items (mapv row->charge (db/query ds (into [sql] args)))}))

(defn get-charge [ds id]
  (row->charge
   (db/execute-one! ds
                    ["SELECT fc.*, ca.name AS candidate_name, ca.id_card, ca.occupation, ca.level,
                             p.name AS plan_name, COALESCE(ro.name, ca.org_name, fc.org_id) AS site
                        FROM cgn_fee_charge fc
                        INNER JOIN cgn_candidate ca ON ca.id = fc.candidate_id
                        LEFT JOIN cgn_recog_plan p ON p.id = fc.plan_id
                        LEFT JOIN cgn_recog_org ro ON ro.id = p.org_id
                       WHERE fc.id = ?" id])))

(defn charge-list [ds params]
  (let [items (mapv #(update % :status {"paid" "charged" "unpaid" "pending" "refunded" "cancelled"})
                    (:items (list-charges ds params)))]
    {:items items}))

(defn write-audit! [ds action charge-id payload]
  (try
    (db/execute! ds
                 ["INSERT INTO audit_log (id, action, resource, resource_id, payload)
                   VALUES (?, ?, 'cgn_fee_charge', ?, ?)"
                  (db/uuid) action charge-id (db/json-str payload)])
    (catch Exception _ nil)))

(defn update-charge-status! [ds id status pay-method]
  (let [pay-date (if (= status "paid")
                   (str (java.time.LocalDate/now))
                   "")]
    (db/execute! ds
                 ["UPDATE cgn_fee_charge
                   SET status = ?, pay_date = ?, pay_method = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?"
                  status pay-date (or pay-method "") id])
    (write-audit! ds (str "finance-" status) id {:status status :payDate pay-date :payMethod pay-method})
    (get-charge ds id)))

(defn summary [ds params]
  (let [items (:items (list-charges ds params))]
    {:total (reduce + 0 (map :amount items))
     :unpaid (reduce + 0 (map :amount (filter #(= "unpaid" (:status %)) items)))
     :paid (reduce + 0 (map :amount (filter #(= "paid" (:status %)) items)))
     :count (count items)}))
