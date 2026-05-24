(ns zhaoyul.exam-system-backend.domain.numbering
  "编号/证书号生成服务 — 全局唯一序列号管理
   计划编号: filing_code + YYYY + MM + 3位顺序号 (SQLite事务内原子递增)
   证书号:   站点代码 + 2位年度 + 1位等级编码 + 6位顺序号 (全局唯一自然排序)"
  (:require
   [next.jdbc :as jdbc]
   [zhaoyul.exam-system-backend.infra.db :as db]))

;; ═══════════════════════════════════════════════════════════════
;; 等级编码映射
;; ═══════════════════════════════════════════════════════════════

(def level->code
  "等级名称 → 编码映射"
  {"五级" "5"
   "四级" "4"
   "三级" "3"
   "二级" "2"
   "一级" "1"})

(def code->level
  "编码 → 等级名称 反向映射"
  {"5" "五级"
   "4" "四级"
   "3" "三级"
   "2" "二级"
   "1" "一级"})

(defn level-code
  "将等级名称转换为编码。五级→5, 四级→4, 三级→3, 二级→2, 一级→1"
  [level-name]
  (or (get level->code level-name)
      (throw (ex-info "无效的等级名称"
                      {:level level-name
                       :valid (keys level->code)}))))

(defn level-name
  "将编码转换为等级名称。"
  [code]
  (or (get code->level code)
      (throw (ex-info "无效的等级编码"
                      {:code code
                       :valid (keys code->level)}))))

;; ═══════════════════════════════════════════════════════════════
;; 序列号核心 — SQLite事务内原子递增
;; ═══════════════════════════════════════════════════════════════

(defn- next-sequence!
  "在事务内对指定seq_key进行原子递增，返回下一个序列号。
   seq_key不存在时自动创建，初始值从0开始递增。"
  [ds seq-key]
  (jdbc/with-transaction [tx ds]
    (let [existing (db/execute-one!
                   tx
                   ["SELECT current_value FROM cgn_sequence WHERE seq_key = ?" seq-key])
          next-val (if existing
                     (inc (:current_value existing))
                     1)]
      (if existing
        (db/execute!
         tx
         ["UPDATE cgn_sequence SET current_value = ?, updated_at = CURRENT_TIMESTAMP WHERE seq_key = ?"
          next-val seq-key])
        (db/execute!
         tx
         ["INSERT INTO cgn_sequence (seq_key, current_value) VALUES (?, ?)"
          seq-key next-val]))
      next-val)))

(defn- pad-left
  "左填充数字到指定宽度"
  [n width]
  (let [s (str n)]
    (if (>= (count s) width)
      s
      (str (apply str (repeat (- width (count s)) \0)) s))))

;; ═══════════════════════════════════════════════════════════════
;; 计划编号生成器
;; ═══════════════════════════════════════════════════════════════

(defn generate-plan-number!
  "生成计划编号: filing_code + YYYY + MM + 3位顺序号
   参数:
     :filing-code — 备案代码 (如 Y0041GD)
     :year        — 年度 (如 2026)
     :month       — 月份 (如 5)
   返回 map: {:plan-number \"...\", :sequence N, :key \"...\"}"
  [ds {:keys [filing-code year month] :as _params}]
  (let [y (str year)
        m (pad-left month 2)
        seq-key (str "plan:" filing-code ":" y ":" m)
        seq-num (next-sequence! ds seq-key)]
    (if (> seq-num 999)
      (throw (ex-info "当月计划编号序列号已用完 (最大999)"
                      {:seq-key seq-key :current seq-num}))
      {:plan-number (str filing-code y m (pad-left seq-num 3))
       :sequence    seq-num
       :key         seq-key})))

;; ═══════════════════════════════════════════════════════════════
;; 证书号生成器
;; ═══════════════════════════════════════════════════════════════

(defn generate-cert-number!
  "生成证书号: 站点代码 + 2位年度 + 1位等级编码 + 6位顺序号
   全局唯一不可重复，自然大排序。
   参数:
     :site-code  — 站点代码 (如 GD)
     :year       — 年度 (如 2026)
     :level      — 等级名称 (如 三级) 或 等级编码 (如 3)
   返回 map: {:cert-number \"...\", :sequence N, :level-code \"...\"}"
  [ds {:keys [site-code year level] :as _params}]
  (let [yy (subs (str year) 2 4)                          ;; 取后2位
        lc (if (re-matches #"\d" (str level))
             (str level)
             (level-code level))
        seq-key "cert:global"
        seq-num (next-sequence! ds seq-key)]
    (if (> seq-num 999999)
      (throw (ex-info "证书号全局序列已用完 (最大999999)"
                      {:seq-key seq-key :current seq-num}))
      {:cert-number (str site-code yy lc (pad-left seq-num 6))
       :sequence    seq-num
       :level-code  lc})))
