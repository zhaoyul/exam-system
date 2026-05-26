(ns zhaoyul.exam-system-backend.domain.reports
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

(defn- ->double1 [value]
  (when value
    (/ (Math/round (* 10.0 (double value))) 10.0)))

(defn score-report [ds _params]
  (let [rows (db/query ds ["SELECT COALESCE(c.org_name, s.org_id, '未归属') AS org,
                                  COUNT(*) AS total,
                                  SUM(CASE WHEN s.total_score >= 60 THEN 1 ELSE 0 END) AS passed,
                                  AVG(s.total_score) AS avg_score
                           FROM cgn_score s
                           LEFT JOIN cgn_candidate c ON c.id = s.candidate_id
                           GROUP BY COALESCE(c.org_name, s.org_id, '未归属')
                           ORDER BY org"])]
    {:items (mapv (fn [row]
                    (let [total (long (:total row))
                          passed (long (or (:passed row) 0))]
                      {:id (:org row)
                       :org (:org row)
                       :total total
                       :pass passed
                       :fail (- total passed)
                       :avg (->double1 (:avg_score row))}))
                  rows)}))

(defn statistics-report [ds params]
  (let [score-items (:items (score-report ds params))
        cert-counts (->> (db/query ds ["SELECT org_id, COUNT(*) AS cert FROM cgn_certificate GROUP BY org_id"])
                         (map (juxt :org_id :cert))
                         (into {}))]
    {:items (mapv (fn [item]
                    (let [cert (or (get cert-counts (:id item)) (:pass item) 0)
                          rate (if (pos? (:total item))
                                 (str (format "%.1f" (* 100.0 (/ (:pass item) (:total item)))) "%")
                                 "0.0%")]
                      (assoc item :cert cert :rate rate)))
                  score-items)}))

(defn registration-report [ds _params]
  {:items (mapv (fn [row]
                  {:id (str (:org row) "-" (:occupation row) "-" (:level row))
                   :org (:org row)
                   :occupation (:occupation row)
                   :level (:level row)
                   :count (:total row)})
                (db/query ds ["SELECT COALESCE(org_name, org_id, '未归属') AS org,
                                      occupation,
                                      level,
                                      COUNT(*) AS total
                               FROM cgn_candidate
                               GROUP BY COALESCE(org_name, org_id, '未归属'), occupation, level
                               ORDER BY org, occupation, level"]))})

(defn arrangement-report [ds _params]
  {:items (mapv (fn [row]
                  {:id (:id row)
                   :examRoom (:exam_room row)
                   :location (:location row)
                   :capacity (:capacity row)
                   :enrolled (:enrolled row)
                   :plan (:plan row)})
                (db/query ds ["SELECT s.id,
                                      r.name AS exam_room,
                                      r.address AS location,
                                      r.seat_count AS capacity,
                                      COALESCE(p.candidate_count, 0) AS enrolled,
                                      p.name AS plan
                               FROM cgn_exam_session s
                               LEFT JOIN cgn_exam_room r ON r.id = s.exam_room_id
                               LEFT JOIN cgn_recog_plan p ON p.id = s.plan_id
                               ORDER BY s.start_at"]))})

(defn report-data [ds kind params]
  (case kind
    "score" (score-report ds params)
    "statistics" (statistics-report ds params)
    "registration" (registration-report ds params)
    "arrangement" (arrangement-report ds params)
    {:items []}))

(def report-columns
  {"score" ["机构" "考试人数" "通过人数" "未通过人数" "平均分"]
   "statistics" ["机构" "认定人数" "通过人数" "获证人数" "通过率"]
   "registration" ["机构" "职业(工种)" "等级" "报名人数"]
   "arrangement" ["考场" "地点" "容量" "已编排" "计划"]})

(defn- row-values [kind row]
  (case kind
    "score" [(:org row) (:total row) (:pass row) (:fail row) (:avg row)]
    "statistics" [(:org row) (:total row) (:pass row) (:cert row) (:rate row)]
    "registration" [(:org row) (:occupation row) (:level row) (:count row)]
    "arrangement" [(:examRoom row) (:location row) (:capacity row) (:enrolled row) (:plan row)]
    []))

(defn report-csv [ds kind params]
  (let [headers (get report-columns kind ["名称" "值"])
        items (:items (report-data ds kind params))]
    (str (csv-line headers)
         "\n"
         (str/join "\n" (map #(csv-line (row-values kind %)) items))
         (when (seq items) "\n"))))

(defn upload-template-csv []
  (str (csv-line ["批次名称" "机构" "上报日期" "数据类型" "记录数" "联系人"])
       "\n"
       (csv-line ["2026年第一批认定数据" "大亚湾核电" "2026-05-26" "成绩/证书" "45" "张三"])
       "\n"))

(defn upload-preview [ds params]
  {:summary {:scoreRows (count (:items (score-report ds params)))
             :registrationRows (count (:items (registration-report ds params)))
             :certificateRows (:total (db/execute-one! ds ["SELECT COUNT(*) AS total FROM cgn_certificate"]))}
   :items [{:name "成绩报表" :status "ready"}
           {:name "报名报表" :status "ready"}
           {:name "证书数据" :status "ready"}]})
