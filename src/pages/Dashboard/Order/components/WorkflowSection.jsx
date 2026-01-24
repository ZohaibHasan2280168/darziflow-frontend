// WorkflowSection.jsx
import { useState, useEffect } from 'react';
import { FiLayers, FiGrid, FiActivity, FiCheckSquare, FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';
import CheckpointItem from './CheckpointItem';

const WorkflowSection = ({
  workflow,
  activeDeptIndex,
  onDeptTabChange,
  orderId,
  onApproveCheckpoint,
  onRejectCheckpoint,
  onFinalApproveCheckpoint,
  onAdminSubmitCheckpoint,
  onPreviewFile,
  adminSubmittingCheckpoint,
  onAdminSubmittingChange
}) => {
  const [expandedOperations, setExpandedOperations] = useState({});
  
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
            key={dept._id?.$oid || index}
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
                  <span className="department-id" title={activeDept.departmentId?.$oid}>
                    ID: {truncateId(activeDept.departmentId?.$oid)}
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
                    <div key={operation._id?.$oid} className="operation-card">
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
                                key={checkpoint._id?.$oid}
                                checkpoint={checkpoint}
                                operationId={operation._id}
                                orderId={orderId}
                                onApprove={onApproveCheckpoint}
                                onReject={onRejectCheckpoint}
                                onFinalApprove={onFinalApproveCheckpoint}
                                onAdminSubmit={onAdminSubmitCheckpoint}
                                onPreviewFile={onPreviewFile}
                                isAdminSubmitting={adminSubmittingCheckpoint === `${operation._id}-${checkpoint._id}`}
                                onAdminSubmittingToggle={() => onAdminSubmittingChange(
                                  adminSubmittingCheckpoint === `${operation._id}-${checkpoint._id}` 
                                    ? null 
                                    : `${operation._id}-${checkpoint._id}`
                                )}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowSection;