import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const normalizeRole = (role: string | undefined) =>
  (role ?? '').trim().toLowerCase().replace(/[_\s-]+/g, '');

function ChannelsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isSuperadmin = normalizeRole(user?.role) === 'superadmin';

  return (
    <div className="glass-panel px-6 py-8 mt-6">
      <h2 className="text-3xl font-semibold text-white mb-4">
        {isSuperadmin ? 'All Channel' : 'My Channel'}
      </h2>
      <p className="text-slate-300 text-lg">
        {isSuperadmin
          ? 'View and manage all channels in the system.'
          : 'View and manage your assigned channels.'}
      </p>
      {/* Add channel list or management UI here */}
    </div>
  );
}

export default ChannelsPage;
