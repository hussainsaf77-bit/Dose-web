import React, { useState, useEffect } from 'react';
import { TelegramUser, SubscriptionTier } from '../types';
import { Users, Crown, Zap, Shield, Search, RefreshCw, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';

interface SubscribersCRMProps {
  currentUser: TelegramUser | null;
  onOpenPlans: () => void;
  onOpenAuth: () => void;
}

export const SubscribersCRM: React.FC<SubscribersCRMProps> = ({
  currentUser,
  onOpenPlans,
  onOpenAuth,
}) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'vip'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleModifyPlan = async (tgId: string, newPlan: SubscriptionTier) => {
    setUpgradingId(tgId);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: tgId, plan: newPlan }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Failed to modify plan:', err);
    } finally {
      setUpgradingId(null);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.telegramId.includes(searchQuery);
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>إدارة المشتركين وباقات الحسابات (CRM)</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            عرض وتعديل اشتراكات المشتركين المشتركة بين بوت التليجرام والموقع الإلكتروني وتعيين الصلاحيات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث القائمة</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو المعرف @username أو ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setPlanFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
              planFilter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            جميع الباقات
          </button>
          <button
            onClick={() => setPlanFilter('pro')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
              planFilter === 'pro' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pro
          </button>
          <button
            onClick={() => setPlanFilter('vip')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
              planFilter === 'vip' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            VIP
          </button>
          <button
            onClick={() => setPlanFilter('free')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
              planFilter === 'free' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Free
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-4">المشترك</th>
                <th className="py-3 px-4">معرف التليجرام</th>
                <th className="py-3 px-4">الباقة الحالية</th>
                <th className="py-3 px-4">تاريخ الانضمام</th>
                <th className="py-3 px-4">آخر نشاط</th>
                <th className="py-3 px-4">الاستهلاك اليومي</th>
                <th className="py-3 px-4">تعديل الباقة فورياً</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    لا يوجد مشتركون مطابقون لخيارات البحث.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.telegramId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 text-xs">
                          {user.firstName[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{user.firstName}</span>
                          {user.username && (
                            <span className="text-slate-500 font-mono text-[11px]">@{user.username}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {user.telegramId}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          user.plan === 'vip'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : user.plan === 'pro'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {user.plan === 'vip' ? (
                          <Crown className="w-3 h-3 text-amber-400" />
                        ) : user.plan === 'pro' ? (
                          <Zap className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Shield className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{user.plan.toUpperCase()}</span>
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>

                    {/* Last Active Date */}
                    <td className="py-3.5 px-4 text-[11px] text-emerald-400 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>
                          {user.lastActiveAt
                            ? new Date(user.lastActiveAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : (user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) : 'الآن')}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {user.plan === 'vip' ? (
                        <span className="text-amber-400">غير محدود (∞)</span>
                      ) : (
                        <span>
                          {user.dailyQuotaUsed} / {user.dailyQuotaTotal}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={upgradingId === user.telegramId || user.plan === 'pro'}
                          onClick={() => handleModifyPlan(user.telegramId, 'pro')}
                          className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-medium disabled:opacity-30"
                        >
                          تعيين Pro
                        </button>
                        <button
                          disabled={upgradingId === user.telegramId || user.plan === 'vip'}
                          onClick={() => handleModifyPlan(user.telegramId, 'vip')}
                          className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded text-[11px] font-medium disabled:opacity-30"
                        >
                          تعيين VIP
                        </button>
                        <button
                          disabled={upgradingId === user.telegramId || user.plan === 'free'}
                          onClick={() => handleModifyPlan(user.telegramId, 'free')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium disabled:opacity-30"
                        >
                          مجاني
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
