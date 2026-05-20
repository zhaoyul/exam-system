(ns zhaoyul.exam-system-backend.web.controllers.catalog
  (:require
   [zhaoyul.exam-system-backend.web.response :as response]))

(def menus
  [{:key "cert" :label "等级认定" :children ["认定机构" "认定监督" "认定统计" "集团证书" "历次认定" "批复设置" "认定批复" "证书上报" "预警违规" "特办申请"]}
   {:key "cert-org" :label "机构等级认定" :children ["等级认定" "考场信息" "报名机构" "考务人员" "监考人员" "阅卷负责" "历次认定" "视频监控" "报名修改" "申请特办"]}
   {:key "theory" :label "理论题库" :children ["科目分类" "科目管理" "知识结构" "试题管理" "结构比重" "组卷规则" "试卷需求" "卷库管理"]}
   {:key "skill" :label "技能题库" :children ["科目分类" "技能科目" "技能模块" "技能试题" "组卷规则" "试卷需求" "卷库管理"]}
   {:key "trace" :label "溯源中心" :children ["溯源查询"]}
   {:key "expert" :label "评价专家" :children ["专家信息" "专家聘用" "督导培训" "考评培训" "专家派遣" "表单管理" "人员统计"]}])

(def options
  {:roles [{:value "group_admin" :label "集团管理员"}
           {:value "branch_admin" :label "机构管理员"}
           {:value "expert" :label "评价专家"}
           {:value "supervisor" :label "督导员"}
           {:value "exam_staff" :label "考务人员"}
           {:value "proctor" :label "监考人员"}
           {:value "candidate" :label "考生"}]
   :statuses ["active" "pending" "processing" "approved" "completed" "locked" "disabled"]
   :levels ["一级" "二级" "三级" "四级" "五级"]
   :occupations ["核反应堆运行值班员" "电气试验员" "机械设备检修工" "仪控设备检修工"]})

(defn list-menus [_]
  (response/ok {:items menus}))

(defn list-options [_]
  (response/ok options))
