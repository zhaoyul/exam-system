import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, MessageSquare, Lock, ChevronRight, ChevronLeft, Shield, BookOpen, Award, ClipboardCheck, BarChart3, FolderOpen, Upload, User, KeyRound, Atom, Users, Building2, GraduationCap, EyeIcon, ClipboardList, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/config/rolePermissions'
import { ROLES, getRolePortal } from '@/config/rolePermissions'

const slides = [
  {
    icon: Shield,
    title: '备案中心',
    desc: '负责集团公司职业技能等级评价机构在人力资源社会保障部备案，确保认定工作合规开展。',
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: BookOpen,
    title: '题库中心',
    desc: '集团公司组织命题专家按国家职业技能标准结合生产实际开发统一标准的评价题库，为分支机构提供评价试卷。',
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    icon: Award,
    title: '证书中心',
    desc: '集团公司对职业技能等级评价证书实行统一管理统一发放，做到全集团公司评价证书联网通用。',
    color: 'from-amber-500 to-amber-700',
  },
  {
    icon: ClipboardCheck,
    title: '评价中心',
    desc: '从评价计划发布、考生报名、考场编排到考试组织实施的全流程管理。',
    color: 'from-purple-500 to-purple-700',
  },
  {
    icon: BarChart3,
    title: '考试中心',
    desc: '成绩录入、复核、公示、勘误及证书颁发等考试后续工作的全面管理。',
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    icon: FolderOpen,
    title: '溯源中心',
    desc: '对职业技能等级评价活动全过程溯源调查，从计划到证书颁发的完整链条追溯。',
    color: 'from-rose-500 to-rose-700',
  },
  {
    icon: Upload,
    title: '监管中心',
    desc: '对集团公司下属分支机构的职业技能等级评价活动进行监督和管理，规范指导分支机构开展评价活动。',
    color: 'from-indigo-500 to-indigo-700',
  },
]

const roleIcons: Record<UserRole, React.ElementType> = {
  group_admin: Shield,
  branch_admin: Building2,
  expert: GraduationCap,
  supervisor: ClipboardList,
  exam_staff: Briefcase,
  proctor: EyeIcon,
  candidate: Users,
}

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [loginType, setLoginType] = useState<'password' | 'sms'>('password')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [captchaCode, setCaptchaCode] = useState('4567')
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('group_admin')
  const [showRoleSelect, setShowRoleSelect] = useState(false)

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const refreshCaptcha = () => {
    setCaptchaCode(String(Math.floor(1000 + Math.random() * 9000)))
    setCaptcha('')
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) {
      setError('请输入账号')
      return
    }
    if (loginType === 'password' && !password.trim()) {
      setError('请输入密码')
      return
    }
    if (!captcha.trim()) {
      setError('请输入验证码')
      return
    }
    if (!showRoleSelect) {
      setShowRoleSelect(true)
      return
    }
    // Mock login with selected role
    const roleInfo = ROLES.find(r => r.key === selectedRole)
    login({
      name: username || (roleInfo?.label || '用户'),
      role: selectedRole,
      org: selectedRole === 'group_admin' ? '集团' :
           selectedRole === 'branch_admin' ? '中国同辐股份有限公司' :
           selectedRole === 'expert' ? '评价专家组' :
           selectedRole === 'supervisor' ? '督导组' :
           selectedRole === 'exam_staff' ? '考务组' :
           selectedRole === 'proctor' ? '监考组' : '个人',
    })
    navigate(getRolePortal(selectedRole), { replace: true })
  }

  const handleBack = () => {
    setShowRoleSelect(false)
  }

  const SlideIcon = slides[currentSlide].icon

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Background image + Slideshow */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/nuclear-bg.jpg)' }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0A1628]/75" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Atom className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">中广核职业技能等级认定平台</h1>
                <p className="text-xs text-white/60">CGN Vocational Skill Level Certification Platform</p>
              </div>
            </div>
          </div>

          {/* Slideshow */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="w-full max-w-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center shadow-lg transition-all duration-500`}>
                  <SlideIcon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white transition-all duration-500">{slides[currentSlide].title}</h2>
              </div>
              <p className="text-white/70 text-sm leading-relaxed min-h-[60px] transition-all duration-500">
                {slides[currentSlide].desc}
              </p>

              {/* Slide indicators */}
              <div className="flex items-center gap-2 mt-8">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>

              {/* Navigation arrows */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/40 text-xs">
            <p>技术支持：中广核集团人力资源部</p>
            <p className="mt-1">京ICP备XXXXXXXX号</p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-[#F9FAFB] p-6">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#1A56DB] flex items-center justify-center mx-auto mb-3">
              <Atom className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">中广核职业技能等级认定平台</h1>
          </div>

          {!showRoleSelect ? (
            /* Login card */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">账号登录</h2>
              <p className="text-xs text-gray-400 text-center mb-5">登录后即可使用平台全部功能</p>

              {/* Login type tabs */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-5">
                <button
                  onClick={() => { setLoginType('password'); setError('') }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${loginType === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  密码登录
                </button>
                <button
                  onClick={() => { setLoginType('sms'); setError('') }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${loginType === 'sms' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  短信登录
                </button>
              </div>

              {error && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    {loginType === 'password' ? '账号' : '手机号'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError('') }}
                      placeholder={loginType === 'password' ? '请输入账号' : '请输入手机号'}
                      className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password / SMS Code */}
                {loginType === 'password' ? (
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">密码</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError('') }}
                        placeholder="请输入密码"
                        className="w-full h-10 pl-9 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">短信验证码</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="请输入验证码"
                          className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]/20 transition-all"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4 text-xs whitespace-nowrap"
                      >
                        获取验证码
                      </Button>
                    </div>
                  </div>
                )}

                {/* Captcha */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">验证码</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={captcha}
                      onChange={e => { setCaptcha(e.target.value); setError('') }}
                      placeholder="请输入验证码"
                      maxLength={4}
                      className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]/20 transition-all text-center tracking-widest font-mono"
                    />
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="h-10 px-3 bg-gray-100 rounded-lg font-mono text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors select-none"
                    >
                      {captchaCode}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-[#1A56DB] hover:bg-[#1748B5] text-white font-medium rounded-lg transition-colors"
                >
                  登 录
                </Button>
              </form>

              <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  记住账号
                </label>
                <button className="hover:text-[#1A56DB] transition-colors">忘记密码？</button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300">其他方式</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="text-center">
                <button className="text-xs text-gray-400 hover:text-[#1A56DB] transition-colors flex items-center gap-1 mx-auto">
                  <MessageSquare className="w-3.5 h-3.5" />
                  联系管理员获取账号
                </button>
              </div>
            </div>
          ) : (
            /* Role Selection */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={handleBack} className="text-gray-400 hover:text-gray-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">选择登录身份</h2>
              </div>
              <p className="text-xs text-gray-400 mb-5 ml-7">请选择您的角色进入对应的工作台</p>

              {error && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                {ROLES.map(role => {
                  const RoleIcon = roleIcons[role.key]
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setSelectedRole(role.key)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        selectedRole === role.key
                          ? 'border-[#1A56DB] bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedRole === role.key ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{role.label}</div>
                        <div className="text-xs text-gray-400">{role.description}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === role.key ? 'border-[#1A56DB]' : 'border-gray-300'
                      }`}>
                        {selectedRole === role.key && <div className="w-2 h-2 rounded-full bg-[#1A56DB]" />}
                      </div>
                    </button>
                  )
                })}

                <Button
                  type="submit"
                  className="w-full h-10 bg-[#1A56DB] hover:bg-[#1748B5] text-white font-medium rounded-lg transition-colors mt-4"
                >
                  进入工作台
                </Button>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            建议使用 Chrome、Firefox、Edge 浏览器访问
          </p>
        </div>
      </div>
    </div>
  )
}
