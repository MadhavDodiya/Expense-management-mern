import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StockManagement = () => {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);

  const [groups, setGroups] = useState([
    'TRAVEL',
    'FOOD',
    'ACCOMMODATION',
    'TRANSPORT',
    'OFFICE_SUPPLIES',
    'SOFTWARE',
    'TRAINING',
    'ENTERTAINMENT',
    'OTHER'
  ]);

  // Stock create form state
  const [stockGroup, setStockGroup] = useState('OTHER');
  const [stockTypes, setStockTypes] = useState([]); // top-level types for stockGroup
  const [stockTypeId, setStockTypeId] = useState('');
  const [stockSubTypes, setStockSubTypes] = useState([]); // children for stockTypeId
  const [stockSubTypeId, setStockSubTypeId] = useState('');
  const [creatingStock, setCreatingStock] = useState(false);
  const [newStock, setNewStock] = useState({ name: '', quantity: 0, maxQuantity: 0 });

  // Type create form state (shown inside stock form)
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typeFormGroup, setTypeFormGroup] = useState('OTHER');
  const [typeFormParents, setTypeFormParents] = useState([]); // top-level types in typeFormGroup
  const [typeFormParentId, setTypeFormParentId] = useState('');
  const [typeFormNames, setTypeFormNames] = useState(['']);
  const [typesLoading, setTypesLoading] = useState(false);

  // Manage types (rename/delete) inside details
  const [manageParentId, setManageParentId] = useState(''); // '' => top-level
  const [manageTypes, setManageTypes] = useState([]); // list for current manageParentId

  // List filters
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [filterTypes, setFilterTypes] = useState([]); // top-level types for groupFilter

  const fetchGroups = async () => {
    try {
      // This endpoint always returns `groups`.
      const res = await axios.get('/api/stock-types');
      if (Array.isArray(res.data.groups) && res.data.groups.length > 0) {
        setGroups(res.data.groups);
      }
    } catch (error) {
      console.error('Fetch groups error:', error);
    }
  };

  const fetchTopTypes = async ({ group, setTo }) => {
    if (!group) return;
    try {
      const res = await axios.get(`/api/stock-types?group=${encodeURIComponent(group)}`);
      setTo(res.data.types || []);
      if (Array.isArray(res.data.groups) && res.data.groups.length > 0) {
        setGroups(res.data.groups);
      }
    } catch (error) {
      console.error('Fetch top types error:', error);
      toast.error('Failed to load types');
      setTo([]);
    }
  };

  const fetchChildTypes = async ({ group, parentId, setTo }) => {
    if (!group || !parentId) {
      setTo([]);
      return;
    }
    try {
      const res = await axios.get(
        `/api/stock-types?group=${encodeURIComponent(group)}&parentId=${encodeURIComponent(parentId)}`
      );
      setTo(res.data.types || []);
    } catch (error) {
      console.error('Fetch child types error:', error);
      toast.error('Failed to load sub types');
      setTo([]);
    }
  };

  const loadStocks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/stocks');
      setStocks(res.data.stocks || []);
    } catch (error) {
      console.error('Load stocks error:', error);
      toast.error('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    loadStocks();
    // Load default type lists
    fetchTopTypes({ group: stockGroup, setTo: setStockTypes });
    fetchTopTypes({ group: typeFormGroup, setTo: setTypeFormParents });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh stock form top-level types when stockGroup changes
  useEffect(() => {
    fetchTopTypes({ group: stockGroup, setTo: setStockTypes });
    setStockTypeId('');
    setStockSubTypeId('');
    setStockSubTypes([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockGroup]);

  // Refresh sub types when stockTypeId changes
  useEffect(() => {
    fetchChildTypes({ group: stockGroup, parentId: stockTypeId, setTo: setStockSubTypes });
    setStockSubTypeId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockGroup, stockTypeId]);

  // Refresh type-form parents when group changes
  useEffect(() => {
    fetchTopTypes({ group: typeFormGroup, setTo: setTypeFormParents });
    setTypeFormParentId('');
    setTypeFormNames(['']);
    setManageParentId('');
    setManageTypes([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFormGroup]);

  // Manage types list (top-level or children)
  useEffect(() => {
    const run = async () => {
      try {
        setTypesLoading(true);
        const url = manageParentId
          ? `/api/stock-types?group=${encodeURIComponent(typeFormGroup)}&parentId=${encodeURIComponent(manageParentId)}`
          : `/api/stock-types?group=${encodeURIComponent(typeFormGroup)}`;
        const res = await axios.get(url);
        setManageTypes(res.data.types || []);
      } catch (error) {
        console.error('Load manage types error:', error);
        setManageTypes([]);
      } finally {
        setTypesLoading(false);
      }
    };

    run();
  }, [manageParentId, typeFormGroup]);

  // List filter types
  useEffect(() => {
    if (groupFilter === 'ALL') {
      setFilterTypes([]);
      setTypeFilter('ALL');
      return;
    }
    fetchTopTypes({ group: groupFilter, setTo: setFilterTypes });
    setTypeFilter('ALL');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupFilter]);

  const sortedStocks = useMemo(() => {
    const list = [...stocks].sort((a, b) => (a.nameNormalized || '').localeCompare(b.nameNormalized || ''));
    const byGroup = groupFilter === 'ALL'
      ? list
      : list.filter(s => ((s.typeId?.group || s.typeGroup || 'OTHER') === groupFilter));

    if (typeFilter === 'ALL') return byGroup;
    const typeIdFilter = String(typeFilter);
    return byGroup.filter(s => String(s.typeId?._id || '') === typeIdFilter);
  }, [stocks, groupFilter, typeFilter]);

  const handleInlineUpdate = async (id, patch) => {
    try {
      const res = await axios.put(`/api/stocks/${id}`, patch);
      setStocks(prev => prev.map(s => (s._id === id ? res.data.stock : s)));
      toast.success('Stock updated');
    } catch (error) {
      console.error('Update stock error:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm('Delete this stock item?')) return;
    try {
      await axios.delete(`/api/stocks/${id}`);
      setStocks(prev => prev.filter(s => s._id !== id));
      toast.success('Stock item deleted');
    } catch (error) {
      console.error('Delete stock error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete stock item');
    }
  };

  const handleCreateStock = async (e) => {
    e.preventDefault();
    try {
      setCreatingStock(true);
      const resolvedTypeId = stockSubTypeId || stockTypeId || undefined;
      const res = await axios.post('/api/stocks', {
        name: newStock.name,
        quantity: Number(newStock.quantity || 0),
        maxQuantity: Number(newStock.maxQuantity || 0),
        typeId: resolvedTypeId
      });
      setStocks(prev => [...prev, res.data.stock]);
      setNewStock(prev => ({ ...prev, name: '', quantity: 0, maxQuantity: 0 }));
      toast.success('Stock item added');
    } catch (error) {
      console.error('Create stock error:', error);
      toast.error(error.response?.data?.message || 'Failed to add stock item');
    } finally {
      setCreatingStock(false);
    }
  };

  const handleCreateTypes = async () => {
    const names = (typeFormNames || []).map(v => (v || '').trim()).filter(Boolean);
    if (names.length === 0) return;

    try {
      setTypesLoading(true);
      let createdCount = 0;
      let existsCount = 0;
      let failedCount = 0;

      for (const name of names) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await axios.post('/api/stock-types', {
            name,
            group: typeFormGroup,
            parentId: typeFormParentId || undefined
          });
          createdCount += 1;
        } catch (err) {
          const message = err.response?.data?.message || '';
          if (typeof message === 'string' && message.toLowerCase().includes('already exists')) {
            existsCount += 1;
            toast.warning(`Type already exists: ${name}`);
          } else {
            failedCount += 1;
            toast.error(message || `Failed to create type: ${name}`);
          }
        }
      }

      if (createdCount > 0) toast.success(`Created ${createdCount} type(s)`);
      if (createdCount === 0 && existsCount > 0 && failedCount === 0) toast.info('No new types created');

      setTypeFormNames(['']);

      // Refresh lists
      await fetchTopTypes({ group: typeFormGroup, setTo: setTypeFormParents });
      await fetchTopTypes({ group: stockGroup, setTo: setStockTypes });
      await fetchChildTypes({ group: stockGroup, parentId: stockTypeId, setTo: setStockSubTypes });
    } catch (error) {
      console.error('Create type error:', error);
      toast.error(error.response?.data?.message || 'Failed to create type');
    } finally {
      setTypesLoading(false);
    }
  };

  const handleRenameType = async (type) => {
    const nextName = window.prompt('Rename type:', type?.name || '');
    if (nextName === null) return;
    const name = (nextName || '').trim();
    if (!name) return;

    try {
      const res = await axios.put(`/api/stock-types/${type._id}`, { name });
      setManageTypes(prev => prev.map(t => (t._id === type._id ? res.data.type : t)));
      loadStocks();
      toast.success('Type updated');
    } catch (error) {
      console.error('Rename type error:', error);
      toast.error(error.response?.data?.message || 'Failed to update type');
    }
  };

  const handleDeleteType = async (type) => {
    if (!window.confirm(`Delete type "${type?.name}"?`)) return;
    try {
      await axios.delete(`/api/stock-types/${type._id}`);
      setManageTypes(prev => prev.filter(t => t._id !== type._id));
      toast.success('Type deleted');
    } catch (error) {
      console.error('Delete type error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete type');
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0">Stocks</h1>
          <p className="text-muted mb-0">Manage stock quantity, capacity, and types</p>
        </div>
        <button className="btn btn-outline-primary" onClick={loadStocks}>
          <i className="fas fa-sync me-2"></i>
          Refresh
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Add Stock Item</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => fetchTopTypes({ group: stockGroup, setTo: setStockTypes })}
            disabled={typesLoading}
          >
            <i className="fas fa-sync me-2"></i>
            Refresh Types
          </button>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateStock}>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Group</label>
                <select className="form-select" value={stockGroup} onChange={(e) => setStockGroup(e.target.value)}>
                  {groups.map(g => (
                    <option key={g} value={g}>{g.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Type</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={stockTypeId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStockTypeId(val);
                      setStockSubTypeId('');
                      // If name is empty, auto-fill from type name.
                      const found = stockTypes.find(t => t._id === val);
                      if (found && !newStock.name) setNewStock(prev => ({ ...prev, name: found.name }));
                    }}
                  >
                    <option value="">Select</option>
                    {stockTypes.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setShowTypeForm(v => !v);
                      setTypeFormGroup(stockGroup);
                      setTypeFormParentId(stockTypeId || '');
                      setTypeFormNames(['']);
                    }}
                    title="Add type"
                  >
                    Add
                  </button>
                </div>
              </div>

              {stockTypeId && stockSubTypes.length > 0 && (
                <div className="col-md-3">
                  <label className="form-label">Sub Type</label>
                  <select
                    className="form-select"
                    value={stockSubTypeId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStockSubTypeId(val);
                      const found = stockSubTypes.find(t => t._id === val);
                      if (found) setNewStock(prev => ({ ...prev, name: found.name }));
                    }}
                  >
                    <option value="">Select</option>
                    {stockSubTypes.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="col-md-5">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={newStock.name}
                  onChange={(e) => setNewStock(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Printer Cartridge"
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Max Quantity</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={newStock.maxQuantity}
                  onChange={(e) => setNewStock(prev => ({ ...prev, maxQuantity: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit" disabled={creatingStock}>
                  {creatingStock ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </form>

          {showTypeForm && (
            <div className="border rounded p-3 mt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="fw-semibold">Add Type</div>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowTypeForm(false)}>
                  Close
                </button>
              </div>
              <div className="row g-2 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">Group</label>
                  <select className="form-select" value={typeFormGroup} onChange={(e) => setTypeFormGroup(e.target.value)}>
                    {groups.map(g => (
                      <option key={g} value={g}>{g.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Parent</label>
                  <select className="form-select" value={typeFormParentId} onChange={(e) => setTypeFormParentId(e.target.value)}>
                    <option value="">(Top Level)</option>
                    {typeFormParents.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Type Name(s)</label>
                  {typeFormNames.map((val, idx) => (
                    <div key={idx} className="input-group mb-2">
                      <input
                        className="form-control"
                        value={val}
                        onChange={(e) => {
                          const next = [...typeFormNames];
                          next[idx] = e.target.value;
                          setTypeFormNames(next);
                        }}
                        placeholder={idx === 0 ? 'e.g. Car / Bike / Taxi' : 'Another type...'}
                      />
                      <button
                        className="btn btn-outline-danger"
                        type="button"
                        onClick={() => setTypeFormNames(prev => prev.filter((_, i) => i !== idx))}
                        disabled={typeFormNames.length === 1}
                        title="Remove"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => setTypeFormNames(prev => [...prev, ''])}>
                    Add More
                  </button>
                </div>
                <div className="col-12">
                  <button
                    className="btn btn-primary"
                    type="button"
                    disabled={typeFormNames.every(v => !(v || '').trim()) || typesLoading}
                    onClick={handleCreateTypes}
                  >
                    {typesLoading ? 'Saving...' : 'Save Type(s)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <details className="mt-3">
            <summary className="fw-semibold">Manage Types (Rename/Delete)</summary>
            <div className="mt-3">
              <div className="row g-2 align-items-end mb-2">
                <div className="col-md-3">
                  <label className="form-label">Group</label>
                  <select className="form-select" value={typeFormGroup} onChange={(e) => setTypeFormGroup(e.target.value)}>
                    {groups.map(g => (
                      <option key={g} value={g}>{g.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">View</label>
                  <select className="form-select" value={manageParentId} onChange={(e) => setManageParentId(e.target.value)}>
                    <option value="">Top Level</option>
                    {typeFormParents.map(t => (
                      <option key={t._id} value={t._id}>Children of: {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {typesLoading ? (
                <div className="text-muted">Loading...</div>
              ) : manageTypes.length === 0 ? (
                <div className="text-muted">No types</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th style={{ width: '220px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manageTypes.map(t => (
                        <tr key={t._id}>
                          <td className="fw-semibold">{t.name}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => handleRenameType(t)}>
                                Rename
                              </button>
                              <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleDeleteType(t)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="small text-muted mt-2">
                Note: You cannot delete a type if it has child types or if it is used by stock items.
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Stock List</h5>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: '200px' }}
              value={groupFilter}
              onChange={(e) => {
                setGroupFilter(e.target.value);
                setTypeFilter('ALL');
              }}
            >
              <option value="ALL">All Groups</option>
              {groups.map(g => (
                <option key={g} value={g}>{g.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              className="form-select form-select-sm"
              style={{ width: '220px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              disabled={groupFilter === 'ALL'}
            >
              <option value="ALL">All Types</option>
              {filterTypes.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            <span className="text-muted small">{sortedStocks.length} items</span>
          </div>
        </div>
        <div className="card-body">
          {sortedStocks.length === 0 ? (
            <div className="text-center text-muted py-4">No stock items</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '160px' }}>Group</th>
                    <th style={{ width: '220px' }}>Type</th>
                    <th>Name</th>
                    <th style={{ width: '140px' }}>Quantity</th>
                    <th style={{ width: '160px' }}>Max Quantity</th>
                    <th style={{ width: '140px' }}>Status</th>
                    <th style={{ width: '340px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.map(item => {
                    const isLimited = Number(item.maxQuantity || 0) > 0;
                    const isFull = isLimited && Number(item.quantity || 0) >= Number(item.maxQuantity || 0);
                    const isBlocked = item.status === 'BLOCKED';
                    const groupName = (item.typeId?.group || item.typeGroup || 'OTHER').toString().replace('_', ' ');
                    return (
                      <tr key={item._id}>
                        <td>
                          <span className="badge bg-light text-dark">{groupName}</span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {(item.typeId?.name || item.type || 'OTHER').toString()}
                          </span>
                        </td>
                        <td className="fw-semibold">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.maxQuantity || 0}</td>
                        <td>
                          {isBlocked ? (
                            <span className="badge bg-secondary">BLOCKED</span>
                          ) : (
                            <span className={`badge ${isFull ? 'bg-danger' : 'bg-success'}`}>
                              {isFull ? 'FULL' : 'ACTIVE'}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleInlineUpdate(item._id, { quantity: Math.max(0, Number(item.quantity || 0) - 1) })}
                              disabled={Number(item.quantity || 0) <= 0}
                              type="button"
                            >
                              -1
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleInlineUpdate(item._id, { quantity: Number(item.quantity || 0) + 1 })}
                              type="button"
                            >
                              +1
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                const max = window.prompt('Set max quantity (0 = unlimited):', String(item.maxQuantity || 0));
                                if (max === null) return;
                                handleInlineUpdate(item._id, { maxQuantity: Number(max) });
                              }}
                              type="button"
                            >
                              Set Max
                            </button>
                            <button
                              className={`btn btn-sm ${isBlocked ? 'btn-success' : 'btn-outline-danger'}`}
                              onClick={() => handleInlineUpdate(item._id, { status: isBlocked ? 'ACTIVE' : 'BLOCKED' })}
                              type="button"
                            >
                              {isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteStock(item._id)} type="button">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
