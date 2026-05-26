(ns zhaoyul.exam-system-backend.domain.archive
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.infra.db :as db]))

(defn- csv-escape [value]
  (let [text (str (or value ""))]
    (if (re-find #"[\",\n\r]" text)
      (str "\"" (str/replace text "\"" "\"\"") "\"")
      text)))

(defn- csv-line [values]
  (str/join "," (map csv-escape values)))

(defn- status-label [status]
  (case status
    "draft" "草稿"
    "pending" "待审核"
    "processing" "进行中"
    "approved" "已通过"
    "completed" "已完成"
    "archived" "已归档"
    "已归档" "已归档"
    (or status "未归档")))

(defn- archive-row [row]
  (let [count (long (or (:candidate_count_actual row) (:candidate_count row) 0))
        cert-count (long (or (:cert_count row) 0))]
    {:id (:id row)
     :planNo (:code row)
     :name (:name row)
     :org (or (:org_name row) (:org_id row) "未归属")
     :date (or (:exam_end_date row) (:exam_start_date row) (:updated_at row))
     :examMonth (or (:planned_month row) "")
     :count count
     :certCount cert-count
     :scoreCount (long (or (:score_count row) 0))
     :auditCount (long (or (:audit_count row) 0))
     :status (if (and (pos? count) (>= cert-count count))
               "已归档"
               (status-label (:status row)))
     :candidates []}))

(defn list-archives [ds params]
  (let [q (some-> (or (get params "q") (get params :q)) str/trim)
        filters (cond-> ["1 = 1"]
                  (seq q) (conj "(p.name LIKE ? OR p.code LIKE ? OR p.org_id LIKE ?)"))
        args (cond-> []
               (seq q) (into (repeat 3 (str "%" q "%"))))
        where (str/join " AND " filters)
        sql (str "SELECT p.id, p.code, p.name, p.org_id, ro.name AS org_name,"
                 " p.planned_month, p.exam_start_date, p.exam_end_date, p.candidate_count, p.status, p.updated_at,"
                 " COUNT(DISTINCT r.candidate_id) AS candidate_count_actual,"
                 " COUNT(DISTINCT s.id) AS score_count,"
                 " COUNT(DISTINCT c.id) AS cert_count,"
                 " COUNT(DISTINCT a.id) AS audit_count"
                 " FROM cgn_recog_plan p"
                 " LEFT JOIN cgn_recog_org ro ON ro.id = p.org_id"
                 " LEFT JOIN cgn_candidate_reg r ON r.plan_id = p.id"
                 " LEFT JOIN cgn_score s ON s.plan_id = p.id"
                 " LEFT JOIN cgn_certificate c ON c.plan_id = p.id"
                 " LEFT JOIN audit_log a ON a.payload LIKE '%' || p.id || '%'"
                 " WHERE " where
                 " GROUP BY p.id, p.code, p.name, p.org_id, ro.name, p.planned_month,"
                 " p.exam_start_date, p.exam_end_date, p.candidate_count, p.status, p.updated_at"
                 " ORDER BY COALESCE(p.exam_end_date, p.updated_at) DESC")]
    {:items (mapv archive-row (db/query ds (into [sql] args)))}))

(defn list-candidates [ds plan-id]
  {:planId plan-id
   :items
   (mapv (fn [row]
           {:id (:id row)
            :name (:name row)
            :idCard (:id_card row)
            :certNo (or (:cert_no row) "")
            :occupation (:occupation row)
            :level (:level row)
            :theory (or (:theory_score row) 0)
            :practical (or (:skill_score row) 0)
            :total (or (:total_score row) 0)})
         (db/query ds
                   ["SELECT ca.id, ca.name, ca.id_card, ca.occupation, ca.level,
                            s.theory_score, s.skill_score, s.total_score,
                            c.cert_no
                       FROM cgn_candidate_reg r
                       INNER JOIN cgn_candidate ca ON ca.id = r.candidate_id
                       LEFT JOIN cgn_score s ON s.plan_id = r.plan_id AND s.candidate_id = r.candidate_id
                       LEFT JOIN cgn_certificate c ON c.plan_id = r.plan_id AND c.id_card = ca.id_card
                      WHERE r.plan_id = ?
                      ORDER BY ca.name, ca.id" plan-id]))})

(defn archive-csv [ds plan-id]
  (let [candidate-rows (:items (list-candidates ds plan-id))
        header (csv-line ["姓名" "身份证号" "证书编号" "职业工种" "等级" "理论成绩" "技能成绩" "总成绩"])]
    (str header
         "\n"
         (str/join "\n"
                   (map #(csv-line [(:name %) (:idCard %) (:certNo %) (:occupation %) (:level %)
                                    (:theory %) (:practical %) (:total %)])
                        candidate-rows))
         (when (seq candidate-rows) "\n"))))
