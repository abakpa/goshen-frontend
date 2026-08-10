import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/resources.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import SkeletonBlock from '../../components/common/SkeletonBlock.jsx';
import FormAlert from '../../components/forms/FormAlert.jsx';
import TextField from '../../components/forms/TextField.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export default function RoleFormPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const permissions = useAsyncData(() => api.staff.permissions(), []);
  const role = useAsyncData(() => (roleId ? api.staff.getRole(roleId) : Promise.resolve(null)), [roleId]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [serverError, setServerError] = useState(null);
  const { register, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const permissionRows = Array.isArray(permissions.data) ? permissions.data : [];
  const isEditing = Boolean(roleId);

  useEffect(() => {
    if (role.data) {
      reset({
        name: role.data.name,
        description: role.data.description || '',
        status: role.data.status || 'active'
      });
      setSelectedPermissions(role.data.permissions || []);
    }
  }, [role.data, reset]);

  const groupedPermissions = useMemo(() => {
    return permissionRows.reduce((groups, permission) => {
      const [moduleName] = permission.split(':');
      groups[moduleName] = groups[moduleName] || [];
      groups[moduleName].push(permission);
      return groups;
    }, {});
  }, [permissionRows]);

  const togglePermission = (permission) => {
    setSelectedPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]);
  };

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      if (selectedPermissions.length === 0) {
        setServerError('Select at least one permission');
        return;
      }
      if (isEditing) {
        await api.staff.updateRole(roleId, { ...values, permissions: selectedPermissions });
      } else {
        await api.staff.createRole({ ...values, permissions: selectedPermissions });
      }
      navigate('/staff');
    } catch (error) {
      setServerError(error.response?.data?.message || `Unable to ${isEditing ? 'update' : 'create'} role`);
    }
  };

  if (permissions.status === 'loading' || role.status === 'loading') return <SkeletonBlock rows={4} />;
  if (permissions.status === 'failed') return <ErrorState message={permissions.error} onRetry={permissions.reload} />;
  if (role.status === 'failed') return <ErrorState message={role.error} onRetry={role.reload} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit role' : 'Create role'}</h1>
        <p className="mt-1 text-sm text-stone-500">Configure what this role can see and do across the application.</p>
      </div>
      <FormAlert message={serverError} />
      <section className="grid gap-4 rounded-lg bg-white p-4 shadow-soft sm:grid-cols-2">
        <TextField label="Role name" error={errors.name?.message} {...register('name', { required: 'Role name is required' })} />
        <TextField label="Description" {...register('description')} />
        <label className="block text-sm font-semibold">
          Status
          <select className="mt-2 min-h-12 w-full rounded-md border border-stone-200 bg-white px-3 font-normal outline-none focus:border-burgundy-500" {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </section>
      <section className="rounded-lg bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Permissions</h2>
          <p className="text-sm font-semibold text-burgundy-700">{selectedPermissions.length} selected</p>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
            <fieldset key={moduleName} className="rounded-md border border-stone-100 p-3">
              <legend className="px-1 text-sm font-bold capitalize">{moduleName.replaceAll('-', ' ')}</legend>
              <div className="mt-2 grid gap-2">
                {modulePermissions.map((permission) => (
                  <label key={permission} className="flex min-h-10 items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" className="h-4 w-4" checked={selectedPermissions.includes(permission)} onChange={() => togglePermission(permission)} />
                    {permission}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>
      <div className="sticky bottom-16 flex justify-end gap-3 rounded-lg bg-cream/95 py-3 backdrop-blur lg:bottom-0">
        <button type="button" onClick={() => navigate('/staff')} className="min-h-11 rounded-md border border-stone-200 bg-white px-4 font-semibold focus-ring">Cancel</button>
        <button disabled={isSubmitting} className="min-h-11 rounded-md bg-burgundy-600 px-5 font-bold text-white focus-ring disabled:opacity-60">
          {isSubmitting ? 'Saving...' : isEditing ? 'Update role' : 'Create role'}
        </button>
      </div>
    </form>
  );
}
