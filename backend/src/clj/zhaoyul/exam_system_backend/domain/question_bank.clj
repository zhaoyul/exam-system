(ns zhaoyul.exam-system-backend.domain.question-bank
  (:require
   [clojure.string :as str]
   [zhaoyul.exam-system-backend.domain.resources :as resources]
   [zhaoyul.exam-system-backend.infra.db :as db]))

(def theory-template-headers
  ["科目ID" "知识结构" "题型" "难度" "分值" "正文" "答案" "解析" "状态"])

(def header-aliases
  {"subjectId" :subjectId
   "科目ID" :subjectId
   "知识结构" :knowledge
   "knowledge" :knowledge
   "题型" :type
   "type" :type
   "难度" :difficulty
   "difficulty" :difficulty
   "分值" :score
   "score" :score
   "正文" :content
   "content" :content
   "答案" :answer
   "answer" :answer
   "解析" :analysis
   "analysis" :analysis
   "状态" :status
   "status" :status})

(defn- body-value [body & keys]
  (some (fn [k]
          (or (get body k)
              (get body (keyword k))
              (get body (str k))))
        keys))

(defn- csv-escape [value]
  (let [text (str (or value ""))]
    (if (re-find #"[\",\n\r]" text)
      (str "\"" (str/replace text "\"" "\"\"") "\"")
      text)))

(defn- csv-line [values]
  (str/join "," (map csv-escape values)))

(defn theory-template-csv []
  (str (csv-line theory-template-headers)
       "\n"
       (csv-line ["theory-subject-001" "核反应堆物理" "单选" "中等" "1" "控制棒的主要作用是什么？" "A" "控制反应性" "valid"])
       "\n"))

(defn- parse-csv-line [line]
  (loop [chars (seq line)
         field []
         row []
         quoted? false]
    (if-let [ch (first chars)]
      (cond
        (and (= ch \") quoted? (= \" (second chars)))
        (recur (nnext chars) (conj field ch) row quoted?)

        (= ch \")
        (recur (next chars) field row (not quoted?))

        (and (= ch \,) (not quoted?))
        (recur (next chars) [] (conj row (apply str field)) quoted?)

        :else
        (recur (next chars) (conj field ch) row quoted?))
      (conj row (apply str field)))))

(defn- parse-csv [content]
  (->> (str/split-lines (str content))
       (remove #(str/blank? (str/trim %)))
       (mapv parse-csv-line)))

(defn- normalize-row [headers row subject-id]
  (let [mapped (reduce-kv
                (fn [acc idx header]
                  (if-let [k (header-aliases (str/trim header))]
                    (assoc acc k (some-> (get row idx) str/trim))
                    acc))
                {}
                (vec headers))
        score (body-value mapped :score "score")]
    (cond-> (assoc mapped
                   :id (or (:id mapped) (db/uuid))
                   :subjectId (or (:subjectId mapped) subject-id "theory-subject-001")
                   :status (or (:status mapped) "valid")
                   :name (or (:content mapped) "未命名试题"))
      (seq (str score)) (assoc :score (Double/parseDouble (str score))))))

(defn import-theory-questions! [ds body]
  (let [content (body-value body :content "content" :text "text")
        subject-id (body-value body :subjectId "subjectId" :subject-id "subject-id")
        rows (parse-csv content)
        headers (first rows)
        data-rows (rest rows)
        errors (atom [])
        imported (->> data-rows
                      (map-indexed
                       (fn [idx row]
                         (try
                           (let [question (normalize-row headers row subject-id)]
                             (if (str/blank? (str (:content question)))
                               (do
                                 (swap! errors conj {:row (+ idx 2) :message "正文不能为空"})
                                 nil)
                               (resources/create-item! ds "theory-questions" question)))
                           (catch Exception ex
                             (swap! errors conj {:row (+ idx 2) :message (.getMessage ex)})
                             nil))))
                      (remove nil?)
                      vec)]
    {:imported (count imported)
     :failed (count @errors)
     :errors @errors
     :items imported}))

(defn export-theory-questions-csv [ds params]
  (let [items (:items (resources/list-items ds "theory-questions" (merge {"limit" 200} params)))
        rows (map (fn [item]
                    [(:subjectId item)
                     (:knowledge item)
                     (:type item)
                     (:difficulty item)
                     (:score item)
                     (or (:content item) (:name item))
                     (:answer item)
                     (:analysis item)
                     (:status item)])
                  items)]
    (str (csv-line theory-template-headers)
         "\n"
         (str/join "\n" (map csv-line rows))
         (when (seq rows) "\n"))))

(defn- valid-question? [question]
  (#{"valid" "有效" "active"} (str (:status question))))

(defn- type-matches? [expected question]
  (let [actual (str (:type question))]
    (case expected
      :single (or (str/includes? actual "单选") (= actual "single"))
      :multi (or (str/includes? actual "多选") (= actual "multi"))
      :judge (or (str/includes? actual "判断") (= actual "judge"))
      true)))

(defn- deterministic-shuffle [seed coll]
  (let [items (java.util.ArrayList. coll)]
    (java.util.Collections/shuffle items (java.util.Random. seed))
    (vec items)))

(defn- number-value [value fallback]
  (try
    (long (Double/parseDouble (str (or value fallback))))
    (catch Exception _ fallback)))

(defn- pick-questions [questions seed type-key count-value score]
  (let [count-value (number-value count-value 0)]
    (->> questions
         (filter #(type-matches? type-key %))
         (deterministic-shuffle (+ seed (hash type-key)))
         (take count-value)
         (mapv #(assoc % :paperScore score)))))

(defn generate-theory-paper! [ds rule-id body]
  (let [rule (or (resources/get-item ds "theory-paper-rules" rule-id)
                 (throw (ex-info "组卷规则不存在" {:type :system.exception/not-found})))
        subject-id (or (body-value body :subjectId "subjectId") (:subjectId rule))
        seed (number-value (body-value body :seed "seed") (System/currentTimeMillis))
        all-questions (:items (resources/list-items ds "theory-questions" {"limit" 200}))
        questions (cond->> all-questions
                    true (filter valid-question?)
                    (seq subject-id) (filter #(= subject-id (:subjectId %))))
        selected (vec (concat
                       (pick-questions questions seed :single (or (:singleCount rule) (:single-count rule) 0) (or (:singleScore rule) 1))
                       (pick-questions questions seed :multi (or (:multiCount rule) (:multi-count rule) 0) (or (:multiScore rule) 2))
                       (pick-questions questions seed :judge (or (:judgeCount rule) (:judge-count rule) 0) (or (:judgeScore rule) 1))))
        paper-no (str "P-" (.format (java.text.SimpleDateFormat. "yyyyMMddHHmmss") (java.util.Date.)))
        total-score (reduce + 0 (map #(double (or (:paperScore %) (:score %) 0)) selected))
        paper (resources/create-item!
               ds
               "paper-library"
               {:name (or (body-value body :name "name")
                          (str (:name rule) "生成试卷"))
                :subjectId subject-id
                :composeMode "题库组卷"
                :paperNo paper-no
                :owner (or (body-value body :owner "owner") "系统组卷")
                :status "已生成"
                :questionCount (count selected)
                :totalScore total-score
                :duration (or (:duration rule) (:durationMinutes rule) 120)
                :ruleId rule-id
                :questions (mapv #(select-keys % [:id :type :content :knowledge :difficulty :answer :analysis :paperScore]) selected)
                :warnings (cond-> []
                            (zero? (count selected)) (conj "未按规则抽取到有效试题"))})]
    paper))

(defn paper-questions [ds paper-id]
  (let [paper (resources/get-item ds "paper-library" paper-id)]
    {:paper paper
     :items (vec (:questions paper))}))
