import { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import './HomeDecorationPage.css';

export const HomeDecorationPage = ({ onNavigate }) => {
  const { 
    inventory, 
    currentHouse, 
    editMode, 
    setEditMode, 
    updateItemPosition, 
    removeItem 
  } = useContext(GameContext);
  
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, itemId) => {
    if (!editMode) return;
    
    const item = inventory.find(i => i.id === itemId);
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = document.querySelector('.home-canvas').getBoundingClientRect();
    
    setDraggingItem(itemId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingItem || !editMode) return;
    
    const container = document.querySelector('.home-canvas');
    const containerRect = container.getBoundingClientRect();
    
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;
    
    updateItemPosition(draggingItem, x, y);
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  const handleDeleteItem = (itemId) => {
    removeItem(itemId);
  };

  return (
    <div className="home-decoration-page">
      <div className="decoration-header">
        <h1>Your Home</h1>
        <div className="button-group">
          <button 
            className={`btn ${editMode ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Save' : 'Edit Mode'}
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('home')}>
            Back to Home
          </button>
        </div>
      </div>

      {!editMode && <div className="info-message">Click "Edit Mode" to arrange your items</div>}
      {editMode && <div className="edit-message">Drag items to move them • Click trash icon to remove</div>}

      <div 
        className="home-canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* House Background */}
        {currentHouse && (
          <div className="house-placeholder">
            <div className="house-text">{currentHouse.toUpperCase()}</div>
          </div>
        )}

        {!currentHouse && (
          <div className="no-house">
            <p>No house yet. Visit the shop to buy one!</p>
          </div>
        )}

        {/* Inventory Items */}
        {inventory.map((item) => (
          <div
            key={item.id}
            className={`inventory-item ${editMode ? 'editable' : ''}`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              cursor: editMode ? 'grab' : 'default',
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            <div className="item-content">
              <div className="item-placeholder">{item.name}</div>
              {editMode && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Remove item"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="inventory-list">
        <h3>Items Placed: {inventory.length}</h3>
        {inventory.length === 0 && <p>No items yet. Visit the shop to buy furniture!</p>}
        {inventory.length > 0 && (
          <ul>
            {inventory.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
