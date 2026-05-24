import { Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import MainLayout from '@/components/MainLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'

// System Management
import UsersPage from '@/pages/system/UsersPage'
import PersonnelPage from '@/pages/system/PersonnelPage'
import FilingGroupPage from '@/pages/system/FilingGroupPage'
import FilingBranchPage from '@/pages/system/FilingBranchPage'
import GroupFiling from '@/pages/filing/GroupFiling'
import EvaluationScope from '@/pages/standard/EvaluationScope'

// Standard
import StandardSettings from '@/pages/standard/StandardSettings'
import ExpertsPage from '@/pages/standard/ExpertsPage'
import TemplatesPage from '@/pages/standard/TemplatesPage'
import StandardPlans from '@/pages/standard/StandardPlans'
import StandardAssignment from '@/pages/standard/StandardAssignment'
import StandardProcess from '@/pages/standard/StandardProcess'
import StandardLibrary from '@/pages/standard/StandardLibrary'

// Question Bank
import TheoryQB from '@/pages/questionBank/TheoryQB'
import SkillQB from '@/pages/questionBank/SkillQB'
import PaperLibrary from '@/pages/questionBank/PaperLibrary'

// Certification
import DashboardGroup from '@/pages/certification/DashboardGroup'
import DashboardBranch from '@/pages/certification/DashboardBranch'
import Organizations from '@/pages/certification/Organizations'
import Supervision from '@/pages/certification/Supervision'
import StatisticsPage from '@/pages/certification/StatisticsPage'
import HistoricalPage from '@/pages/certification/HistoricalPage'
import ApprovalSettingsPage from '@/pages/certification/ApprovalSettingsPage'
import Plans from '@/pages/certification/Plans'
import ExamRoomPage from '@/pages/certification/ExamRoomPage'
import FeeSettingsPage from '@/pages/certification/FeeSettingsPage'
import CertificatesGroup from '@/pages/certification/CertificatesGroup'
import CertificatesPrint from '@/pages/certification/CertificatesPrint'
import CertReportPage from '@/pages/certification/CertReportPage'
import ApprovalPage from '@/pages/certification/ApprovalPage'
import ViolationsPage from '@/pages/certification/ViolationsPage'
import SpecialPage from '@/pages/certification/SpecialPage'
// Question Bank
import SubjectSort from '@/pages/question/SubjectSort'
import SkillSubjectSort from '@/pages/question/SkillSubjectSort'
import SubjectManage from '@/pages/question/SubjectManage'
import KnowledgeStructure from '@/pages/question/KnowledgeStructure'
import StructureRatio from '@/pages/question/StructureRatio'
import PaperRules from '@/pages/question/PaperRules'
import PaperRequirements from '@/pages/question/PaperRequirements'
import SkillSubjectManage from '@/pages/question/SkillSubject'
import SkillModuleManage from '@/pages/question/SkillModule'
import SkillPaperRules from '@/pages/question/SkillPaperRules'
import SkillPaperRequirements from '@/pages/question/SkillPaperRequirements'

import ExamRegistration from '@/pages/certification/ExamRegistration'
import ExamArrangement from '@/pages/certification/ExamArrangement'
import ExamSessionArrange from '@/pages/certification/ExamSessionArrange'
import CertDeclaration from '@/pages/certification/CertDeclaration'
import EvaluatorStaff from '@/pages/certification/EvaluatorStaff'
import StaffManage from '@/pages/certification/StaffManage'
import MarkingLeadPage from '@/pages/certification/MarkingLeadPage'
import EnrollModifyPage from '@/pages/certification/EnrollModifyPage'
import FinanceWorkbench from '@/pages/finance/FinanceWorkbench'
import FeeChargePage from '@/pages/finance/FeeChargePage'
import FeeListPage from '@/pages/finance/FeeListPage'
import FeeLedgerPage from '@/pages/finance/FeeLedgerPage'
import FeeStandardPage from '@/pages/finance/FeeStandardPage'
import ScorePublicityManage from '@/pages/certification/ScorePublicityManage'
import SupervisorManage from '@/pages/certification/SupervisorManage'
import VideoMonitorPage from '@/pages/certification/VideoMonitorPage'

// Grading
import GradingPage from '@/pages/grading/GradingPage'

// Score
import ScoreEntry from '@/pages/score/ScoreEntry'
import ScoreReview from '@/pages/score/ScoreReview'
import ScorePublicity from '@/pages/score/ScorePublicity'
import ScoreCorrection from '@/pages/score/ScoreCorrection'

// Certificate
import CertIssue from '@/pages/certificate/CertIssue'
import CertView from '@/pages/certificate/CertView'
import CertReissue from '@/pages/certificate/CertReissue'

// Supervision
import TrainingPage from '@/pages/supervision/TrainingPage'
import EvaluatorTrainingPage from '@/pages/supervision/EvaluatorTrainingPage'
import ExpertInfoPage from '@/pages/supervision/ExpertInfoPage'
import HiringPage from '@/pages/supervision/HiringPage'
import DispatchPage from '@/pages/supervision/DispatchPage'
import FormsPage from '@/pages/supervision/FormsPage'
import PersonnelStatisticsPage from '@/pages/supervision/PersonnelStatisticsPage'

// Report
import ScoreReport from '@/pages/report/ScoreReport'
import StatisticsReport from '@/pages/report/StatisticsReport'
import ReportDataUpload from '@/pages/report/ReportDataUpload'
import RegistrationReport from '@/pages/report/RegistrationReport'
import ArrangementReport from '@/pages/report/ArrangementReport'

// Archive
import ArchivePage from '@/pages/archive/ArchivePage'

// Traceability
import TraceabilityCenter from '@/pages/traceability/TraceabilityCenter'

// Monitor
import ExamMonitor from '@/pages/monitor/ExamMonitor'

// Messages
import MessageCenter from '@/pages/message/MessageCenter'

// Exam Center
import ExamManage from '@/pages/exam/ExamManage'
import OnlineExam from '@/pages/exam/OnlineExam'
import SeatArrange from '@/pages/exam/SeatArrange'

// Candidate Management
import CandidateManage from '@/pages/candidate/CandidateManage'

// Public Cert Query
import PublicCertQuery from '@/pages/cert/PublicCertQuery'

// System Config
import SystemConfig from '@/pages/system/SystemConfig'

// Personal Center
import ScoreQuery from '@/pages/personal/ScoreQuery'
import CertQuery from '@/pages/personal/CertQuery'
import AdmissionTicket from '@/pages/personal/AdmissionTicket'

// Province Filing
import ProvinceFiling from '@/pages/filing/ProvinceFiling'
import BranchFiling from '@/pages/filing/BranchFiling'

// Personal Center
import SelfRegistration from '@/pages/personal/SelfRegistration'

// System
import Announcements from '@/pages/system/Announcements'
import SystemLogs from '@/pages/system/SystemLogs'

// Data Center
import DataCenter from '@/pages/data/DataCenter'

// Marking
import MarkingManage from '@/pages/grading/MarkingManage'

// Cert Execution (机构端认定流程)
import CertExecution from '@/pages/certification/CertExecution'
import RegistrationOrgManage from '@/pages/certification/RegistrationOrgManage'
import ExamStaffManage from '@/pages/certification/ExamStaffManage'

// Workbenches
import CertWorkbench from '@/pages/workbenches/CertWorkbench'
import TheoryQBWorkbench from '@/pages/workbenches/TheoryQBWorkbench'
import SkillQBWorkbench from '@/pages/workbenches/SkillQBWorkbench'
import TraceabilityWorkbench from '@/pages/workbenches/TraceabilityWorkbench'
import ExpertWorkbench from '@/pages/workbenches/ExpertWorkbench'
import FilingWorkbench from '@/pages/workbenches/FilingWorkbench'
import BasicDataWorkbench from '@/pages/workbenches/BasicDataWorkbench'
import BranchPortal from '@/pages/workbenches/BranchPortal'
import SupervisorPortal from '@/pages/workbenches/SupervisorPortal'
import ExamStaffWorkbench from '@/pages/workbenches/ExamStaffWorkbench'
import ProctorWorkbench from '@/pages/workbenches/ProctorWorkbench'
import CandidatePortal from '@/pages/workbenches/CandidatePortal'

// File Transfer
import DistributePage from '@/pages/fileTransfer/DistributePage'
import ReceivePage from '@/pages/fileTransfer/ReceivePage'
import DocViewerPage from '@/pages/fileTransfer/DocViewerPage'
import PrivatePage from '@/pages/fileTransfer/PrivatePage'
import ParamSettings from '@/pages/fileTransfer/ParamSettings'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* System Management */}
          <Route path="/system/users" element={<UsersPage />} />
          <Route path="/system/personnel" element={<PersonnelPage />} />
          <Route path="/system/filing-group" element={<FilingGroupPage />} />
          <Route path="/system/filing-branch" element={<FilingBranchPage />} />
          <Route path="/system/filing-branch/apply" element={<FilingBranchPage />} />
          <Route path="/system/filing-branch/modify" element={<FilingBranchPage />} />
          <Route path="/filing/group" element={<GroupFiling />} />
          <Route path="/standard/evaluation-scope" element={<EvaluationScope />} />
          {/* Standard */}
          <Route path="/standard/settings" element={<StandardSettings />} />
          <Route path="/standard/experts" element={<ExpertsPage />} />
          <Route path="/standard/templates" element={<TemplatesPage />} />
          <Route path="/standard/plans" element={<StandardPlans />} />
          <Route path="/standard/assignment" element={<StandardAssignment />} />
          <Route path="/standard/process" element={<StandardProcess />} />
          <Route path="/standard/library" element={<StandardLibrary />} />
          {/* Question Bank */}
          <Route path="/question/theory" element={<TheoryQB />} />
          <Route path="/question/skill" element={<SkillQB />} />
          <Route path="/question/paper-rules" element={<PaperRules />} />
          <Route path="/question/paper-require" element={<PaperRequirements />} />
          <Route path="/question/paper-library" element={<PaperLibrary />} />
          {/* Certification */}
          <Route path="/cert/dashboard-group" element={<DashboardGroup />} />
          <Route path="/cert/dashboard-branch" element={<DashboardBranch />} />
          <Route path="/cert/organizations" element={<Organizations />} />
          <Route path="/cert/supervision" element={<Supervision />} />
          <Route path="/cert/statistics" element={<StatisticsPage />} />
          <Route path="/cert/historical" element={<HistoricalPage />} />
          <Route path="/cert/approval-settings" element={<ApprovalSettingsPage />} />
          <Route path="/cert/plans" element={<Plans />} />
          <Route path="/cert/exam-rooms" element={<ExamRoomPage />} />
          <Route path="/cert/fee-settings" element={<FeeSettingsPage />} />
          <Route path="/cert/certificates-group" element={<CertificatesGroup />} />
          <Route path="/cert/certificates-print" element={<CertificatesPrint />} />
          <Route path="/cert/cert-report" element={<CertReportPage />} />
          <Route path="/cert/approval" element={<ApprovalPage />} />
          <Route path="/cert/violations" element={<ViolationsPage />} />
          <Route path="/cert/special" element={<SpecialPage />} />
          {/* Cert Execution (机构端认定流程) - 8步流程容器 */}
          <Route path="/cert/exec/*" element={<CertExecution />} />
          {/* Cert sub-pages (独立访问入口) */}
          <Route path="/cert/exam-registration" element={<ExamRegistration />} />
          <Route path="/cert/exam-arrangement" element={<ExamArrangement />} />
          <Route path="/cert/exam-session" element={<ExamSessionArrange />} />
          <Route path="/cert/score-publicity-manage" element={<ScorePublicityManage />} />
          <Route path="/cert/supervisors" element={<StaffManage staffType="proctor" title="监考人员" />} />
          <Route path="/cert/registration-orgs" element={<RegistrationOrgManage />} />
          <Route path="/cert/exam-staff" element={<StaffManage staffType="exam_staff" title="考务人员" />} />
          <Route path="/cert/evaluator-staff" element={<StaffManage staffType="evaluator" title="考评人员" />} />
          <Route path="/cert/marking-lead" element={<MarkingLeadPage />} />
          <Route path="/cert/enroll-modify" element={<EnrollModifyPage />} />
          <Route path="/cert/declaration" element={<CertDeclaration />} />
          {/* Finance System */}
          <Route path="/finance/workbench" element={<FinanceWorkbench />} />
          <Route path="/finance/charge" element={<FeeChargePage />} />
          <Route path="/finance/list" element={<FeeListPage />} />
          <Route path="/finance/ledger" element={<FeeLedgerPage />} />
          <Route path="/finance/standard" element={<FeeStandardPage />} />
          {/* Question Bank */}
          <Route path="/question/subject-sort" element={<SubjectSort />} />
          <Route path="/question/subjects" element={<SubjectManage />} />
          <Route path="/question/knowledge" element={<KnowledgeStructure />} />
          <Route path="/question/ratio" element={<StructureRatio />} />
          <Route path="/question/paper-rules" element={<PaperRules />} />
          <Route path="/question/paper-require" element={<PaperRequirements />} />
          <Route path="/question/skill-subjects" element={<SkillSubjectManage />} />
          <Route path="/question/skill-subject-sort" element={<SkillSubjectSort />} />
          <Route path="/question/skill-modules" element={<SkillModuleManage />} />
          <Route path="/question/skill-rules" element={<SkillPaperRules />} />
          <Route path="/question/skill-require" element={<SkillPaperRequirements />} />
          {/* Grading */}
          <Route path="/grading" element={<GradingPage />} />
          {/* Score */}
          <Route path="/score/entry" element={<ScoreEntry />} />
          <Route path="/score/review" element={<ScoreReview />} />
          <Route path="/score/publicity" element={<ScorePublicity />} />
          <Route path="/score/correction" element={<ScoreCorrection />} />
          {/* Certificate */}
          <Route path="/certificate/issue" element={<CertIssue />} />
          <Route path="/certificate/view" element={<CertView />} />
          <Route path="/certificate/reissue" element={<CertReissue />} />
          {/* Supervision */}
          <Route path="/supervision/training" element={<TrainingPage />} />
          <Route path="/supervision/evaluator-training" element={<EvaluatorTrainingPage />} />
          <Route path="/supervision/expert-info" element={<ExpertInfoPage />} />
          <Route path="/supervision/hiring" element={<HiringPage />} />
          <Route path="/supervision/dispatch" element={<DispatchPage />} />
          <Route path="/supervision/forms" element={<FormsPage />} />
          <Route path="/supervision/personnel-statistics" element={<PersonnelStatisticsPage />} />
          {/* Report */}
          <Route path="/report/score" element={<ScoreReport />} />
          <Route path="/report/statistics" element={<StatisticsReport />} />
          <Route path="/report/data-upload" element={<ReportDataUpload />} />
          <Route path="/report/registration" element={<RegistrationReport />} />
          <Route path="/report/arrangement" element={<ArrangementReport />} />
          {/* Archive */}
          <Route path="/archive" element={<ArchivePage />} />
          {/* Traceability */}
          <Route path="/traceability" element={<TraceabilityCenter />} />
          {/* Monitor */}
          <Route path="/monitor" element={<ExamMonitor />} />
          <Route path="/cert/video-monitor" element={<VideoMonitorPage />} />
          {/* Messages */}
          <Route path="/messages" element={<MessageCenter />} />
          {/* Exam Center */}
          <Route path="/exam/manage" element={<ExamManage />} />
          <Route path="/exam/online" element={<OnlineExam />} />
          <Route path="/exam/seats" element={<SeatArrange />} />
          {/* Candidate Management */}
          <Route path="/candidates/manage" element={<CandidateManage />} />
          {/* Public Cert Query */}
          <Route path="/cert/public-query" element={<PublicCertQuery />} />
          {/* System Config */}
          <Route path="/system/config" element={<SystemConfig />} />
          {/* Personal Center */}
          <Route path="/personal/score" element={<ScoreQuery />} />
          <Route path="/personal/cert" element={<CertQuery />} />
          <Route path="/personal/ticket" element={<AdmissionTicket />} />
          {/* Province Filing */}
          <Route path="/filing/province" element={<ProvinceFiling />} />
          <Route path="/filing/branch" element={<BranchFiling />} />
          {/* Personal Center */}
          <Route path="/personal/register" element={<SelfRegistration />} />
          {/* System */}
          <Route path="/system/announcements" element={<Announcements />} />
          <Route path="/system/logs" element={<SystemLogs />} />
          {/* Data Center */}
          <Route path="/data/center" element={<DataCenter />} />
          {/* Marking */}
          <Route path="/grading/marking" element={<MarkingManage />} />
          {/* File Transfer */}
          <Route path="/file/distribute" element={<DistributePage />} />
          <Route path="/file/receive" element={<ReceivePage />} />
          <Route path="/file/viewer" element={<DocViewerPage />} />
          <Route path="/file/private" element={<PrivatePage />} />
          <Route path="/file/settings" element={<ParamSettings />} />
          {/* Module Workbenches */}
          <Route path="/wb/cert" element={<CertWorkbench />} />
          <Route path="/wb/theory" element={<TheoryQBWorkbench />} />
          <Route path="/wb/skill" element={<SkillQBWorkbench />} />
          <Route path="/wb/traceability" element={<TraceabilityWorkbench />} />
          <Route path="/wb/expert" element={<ExpertWorkbench />} />
          <Route path="/wb/filing" element={<FilingWorkbench />} />
          <Route path="/wb/basic-data" element={<BasicDataWorkbench />} />
          {/* Role Portals */}
          <Route path="/branch/portal" element={<BranchPortal />} />
          <Route path="/supervisor/portal" element={<SupervisorPortal />} />
          <Route path="/examstaff/portal" element={<ExamStaffWorkbench />} />
          <Route path="/proctor/portal" element={<ProctorWorkbench />} />
          <Route path="/candidate/portal" element={<CandidatePortal />} />
          {/* Default redirect */}
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
