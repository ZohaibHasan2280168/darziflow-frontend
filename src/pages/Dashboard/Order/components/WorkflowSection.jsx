import { useState, useEffect } from 'react';
import { FiLayers, FiGrid, FiActivity, FiCheckSquare, FiChevronDown, FiChevronUp, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import CheckpointItem from './CheckpointItem';
import { useAuth } from '../../../../components/context/AuthContext';


const WorkflowSection = ({
  workflow,
  activeDeptIndex,
  onDeptTabChange,
  orderId,
  onFinalApproveCheckpoint,
  onPreviewFile,
}) => {
  const { user } = useAuth();
  const [expandedOperations, setExpandedOperations] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get status style
  const getStatusStyle = (status) => {
    const statusColor = {
      UPLOADED: 'status-uploaded',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      PENDING: 'status-pending',
      IN_PROGRESS: 'status-in-progress',
      COMPLETED: 'status-completed',
    };
    return statusColor[status] || 'status-pending';
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  const activeDept = workflow[activeDeptIndex];

  // Initialize expanded operations based on status
  useEffect(() => {
    if (activeDept?.operations) {
      const initialExpanded = {};
      activeDept.operations.forEach((operation, index) => {
        // Expand current operation (IN_PROGRESS or first PENDING)
        if (operation.status === 'IN_PROGRESS') {
          initialExpanded[index] = true;
        } else if (operation.status === 'PENDING' && 
                  !activeDept.operations.some(op => op.status === 'IN_PROGRESS') &&
                  !Object.values(initialExpanded).some(val => val)) {
          // Expand first PENDING if no IN_PROGRESS exists
          initialExpanded[index] = true;
        } else if (operation.status === 'COMPLETED') {
          // Collapse completed operations by default
          initialExpanded[index] = false;
        } else {
          initialExpanded[index] = false;
        }
      });
      setExpandedOperations(initialExpanded);
    }
  }, [activeDept]);

  const toggleOperationExpansion = (index) => {
    setExpandedOperations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Calculate operation progress
  const calculateOperationProgress = (operation) => {
    if (!operation.checkpoints || operation.checkpoints.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const completed = operation.checkpoints.filter(
      cp => cp.status === 'COMPLETED' || cp.status === 'APPROVED'
    ).length;
    const total = operation.checkpoints.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const allOperationsCompleted = activeDept?.operations?.every(op => op.status === 'COMPLETED') || false;
  
  let lastOperationId = null;
  let lastCheckpointId = null;
  
  if (activeDept?.operations?.length > 0) {
    const lastOp = activeDept.operations[activeDept.operations.length - 1];
    lastOperationId = lastOp._id;
    if (lastOp.checkpoints?.length > 0) {
      lastCheckpointId = lastOp.checkpoints[lastOp.checkpoints.length - 1]._id;
    }
  }

  const showFinalApprove = user?.role === 'ADMIN' && 
                           allOperationsCompleted && 
                           activeDept?.status === 'IN_PROGRESS' && 
                           lastOperationId && lastCheckpointId;

  const handleDepartmentFinalApprove = async () => {
    if (!window.confirm("Are you sure you want to grant final approval for this department?")) return;
    setIsProcessing(true);
    try {
      await onFinalApproveCheckpoint(lastCheckpointId, lastOperationId);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="segment-section workflow-section">
      <div className="segment-header">
        <div className="segment-title-wrapper">
          <FiLayers size={20} />
          <h2 className="segment-title">Workflow</h2>
        </div>
        <p className="segment-subtitle">
          {workflow.length} department{workflow.length > 1 ? 's' : ''} in pipeline
        </p>
      </div>

      {/* Department Tabs */}
      <div className="dept-tabs">
        {workflow.map((dept, index) => (
          <button
            key={dept._id || index}
            className={`dept-tab ${index === activeDeptIndex ? 'active' : ''}`}
            onClick={() => onDeptTabChange(index)}
          >
            {dept.departmentName}
            <span className={`dept-status-badge ${getStatusStyle(dept.status)}`}>
              {dept.status?.charAt(0)}
            </span>
          </button>
        ))}
      </div>

      {/* Active Department Content */}
      {activeDept && (
        <div className="active-dept-content">
          <div className="department-card">
            {/* Department Header */}
            <div className="department-header">
              <div className="department-info">
                <div className="department-icon-wrapper">
                  <FiGrid size={20} />
                </div>
                <div className="department-details">
                  <h3 className="department-name">{activeDept.departmentName}</h3>
                  <span className="department-id" title={activeDept.departmentId}>
                    ID: {truncateId(activeDept.departmentId)}
                  </span>
                </div>
              </div>
              <span className={`department-status ${getStatusStyle(activeDept.status)}`}>
                {activeDept.status?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Operations - Now Expandable */}
            {activeDept.operations && activeDept.operations.length > 0 && (
              <div className="operations-container">
                {activeDept.operations.map((operation, operationIndex) => {
                  const progress = calculateOperationProgress(operation);
                  const isExpanded = expandedOperations[operationIndex];
                  
                  return (
                    <div key={operation._id} className="operation-card">
                      {/* Operation Header - Clickable for Expansion */}
                      <div 
                        className="operation-header expandable"
                        onClick={() => toggleOperationExpansion(operationIndex)}
                      >
                        <div className="operation-info">
                          <div className="operation-icon-wrapper">
                            <FiActivity size={16} />
                          </div>
                          <span className="operation-name">{operation.name}</span>
                          <div className="operation-progress">
                            <span className="progress-text">
                              {progress.completed}/{progress.total} Checkpoints
                            </span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="operation-header-right">
                          <span className={`operation-status ${getStatusStyle(operation.status)}`}>
                            {operation.status?.replace(/_/g, ' ')}
                          </span>
                          <button 
                            className="expand-toggle-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOperationExpansion(operationIndex);
                            }}
                          >
                            {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Checkpoints Container - Collapsible */}
                      {isExpanded && operation.checkpoints && operation.checkpoints.length > 0 && (
                        <div className="checkpoints-container">
                          <div className="checkpoints-label">
                            <FiCheckSquare size={14} />
                            <span>Checkpoints ({operation.checkpoints.length})</span>
                          </div>
                          <div className="checkpoints-list">
                            {operation.checkpoints.map((checkpoint) => (
                                <CheckpointItem
                                  key={checkpoint._id}
                                  checkpoint={checkpoint}
                                  operationId={operation._id}
                                  orderId={orderId}
                                  onFinalApprove={onFinalApproveCheckpoint}
                                  onPreviewFile={onPreviewFile}
                                />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Final Approve Button (Admin Only, when all ops are completed) */}
            {showFinalApprove && (
              <div className="department-final-approve-section" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Department Completed</h4>
                  <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>All operations have passed QC. Grant final approval to send to the client.</p>
                </div>
                <button 
                  className="action-btn final-approve-btn"
                  onClick={handleDepartmentFinalApprove}
                  disabled={isProcessing}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                >
                  <FiCheckCircle size={16} />
                  {isProcessing ? 'Processing...' : 'Final Approve Department'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowSection;
