import { useContext, useEffect, useMemo, useState } from 'react';
import { GameContext } from '../context/GameContext';
import './HomePage.css';
import shackImg from '../assets/houses/shack.png';
import cabinImg from '../assets/houses/cabin.png';
import houseImg from '../assets/houses/house.png';
import mansionImg from '../assets/houses/mansion.png';
import grassImg from '../assets/grass.jpg';

export const HomePage = ({ onNavigate }) => {
  const {
    currentDay,
    logsEarned,
    currentHouse,
    housePosition,
    updateHousePosition,
    houseScale,
    updateHouseScale,
    inventory,
    placeInventoryItem,
    updateItemPosition,
    updateItemScale,
    removeItem,
    editMode,
    setEditMode,
    homeDirty,
    setHomeDirty,
    homePopup,
    setHomePopup,
  } = useContext(GameContext);
  const [dragging, setDragging] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const houseLabels = {
    shack: 'Shack',
    cabin: 'Cabin',
    house: 'House',
    mansion: 'Mansion',
  };
  const houseImages = {
    shack: shackImg,
    cabin: cabinImg,
    house: houseImg,
    mansion: mansionImg,
  };

  const placedItems = useMemo(() => inventory.filter((item) => item.placed), [inventory]);
  const unplacedItems = useMemo(() => inventory.filter((item) => !item.placed), [inventory]);

  useEffect(() => {
    if (!homePopup) return;
    const timeout = setTimeout(() => setHomePopup(''), 2200);
    return () => clearTimeout(timeout);
  }, [homePopup, setHomePopup]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!homeDirty) return;
      event.preventDefault();
      event.returnValue = 'You have unsaved home changes. Are you sure you want to close?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [homeDirty]);

  useEffect(() => {
    if (!editMode) {
      setSelectedObject(null);
      setDragging(null);
    }
  }, [editMode]);
  
  const handleDayClick = (day) => {
    if (day <= currentDay) {
      onNavigate('quiz');
    }
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  const getCanvasPoint = (event) => {
    const canvas = document.querySelector('.grass-canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const startDragHouse = (event) => {
    if (!editMode || !currentHouse) return;
    event.stopPropagation();
    setSelectedObject({ type: 'house' });
    const rect = event.currentTarget.getBoundingClientRect();
    setDragging({
      mode: 'move-house',
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    });
  };

  const startDragItem = (event, itemId) => {
    if (!editMode) return;
    event.stopPropagation();
    setSelectedObject({ type: 'item', id: itemId });
    const rect = event.currentTarget.getBoundingClientRect();
    setDragging({
      mode: 'move-item',
      itemId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    });
  };

  const startResizeHouse = (event) => {
    if (!editMode || !currentHouse) return;
    event.stopPropagation();
    setSelectedObject({ type: 'house' });
    setDragging({
      mode: 'resize-house',
      startY: event.clientY,
      startScale: houseScale,
    });
  };

  const startResizeItem = (event, itemId, itemScale) => {
    if (!editMode) return;
    event.stopPropagation();
    setSelectedObject({ type: 'item', id: itemId });
    setDragging({
      mode: 'resize-item',
      itemId,
      startY: event.clientY,
      startScale: itemScale,
    });
  };

  const handleCanvasMouseMove = (event) => {
    if (!editMode || !dragging) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    if (dragging.mode === 'move-house') {
      const houseWidth = 140 * houseScale;
      const houseHeight = 140 * houseScale;
      const x = clamp(point.x - dragging.offsetX, 0, point.width - houseWidth);
      const y = clamp(point.y - dragging.offsetY, 0, point.height - houseHeight);
      updateHousePosition(x, y);
      setHomeDirty(true);
    }

    if (dragging.mode === 'move-item') {
      const item = inventory.find((invItem) => invItem.id === dragging.itemId);
      const itemScale = item?.scale || 1;
      const itemWidth = 110 * itemScale;
      const itemHeight = 80 * itemScale;
      const x = clamp(point.x - dragging.offsetX, 0, point.width - itemWidth);
      const y = clamp(point.y - dragging.offsetY, 0, point.height - itemHeight);
      updateItemPosition(dragging.itemId, x, y);
      setHomeDirty(true);
    }

    if (dragging.mode === 'resize-house') {
      const delta = (dragging.startY - event.clientY) * 0.005;
      updateHouseScale(dragging.startScale + delta);
      setHomeDirty(true);
    }

    if (dragging.mode === 'resize-item') {
      const delta = (dragging.startY - event.clientY) * 0.005;
      updateItemScale(dragging.itemId, dragging.startScale + delta);
      setHomeDirty(true);
    }
  };

  const stopDrag = () => {
    setDragging(null);
  };

  const handleDropOnGrass = (event) => {
    if (!editMode) return;
    event.preventDefault();

    const itemIdRaw = event.dataTransfer.getData('itemId');
    if (!itemIdRaw) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    const itemId = Number(itemIdRaw);
    const x = clamp(point.x - 55, 0, point.width - 110);
    const y = clamp(point.y - 40, 0, point.height - 80);
    placeInventoryItem(itemId, x, y);
    setHomeDirty(true);
  };

  const placeItemAtRandomSpot = (itemId) => {
    if (!editMode) return;

    const canvas = document.querySelector('.grass-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const item = inventory.find((invItem) => invItem.id === itemId);
    const itemScale = item?.scale || 1;
    const itemWidth = 110 * itemScale;
    const itemHeight = 80 * itemScale;

    const maxX = Math.max(0, rect.width - itemWidth);
    const maxY = Math.max(0, rect.height - itemHeight);

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    placeInventoryItem(itemId, x, y);
    setSelectedObject({ type: 'item', id: itemId });
    setHomeDirty(true);
  };

  return (
    <div className="home-page">
      {homePopup && <div className="home-popup">{homePopup}</div>}

      <div className="home-wrapper">
        <div className="home-content">
          <div className="header-top">
            <h1>Tree Chopper</h1>
            <div className="logs-badge">{logsEarned} logs</div>
          </div>

          <div className="week-selector">
            <p className="week-title">Select a day to practice</p>
            <div className="stumps-row">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <button
                  key={day}
                  className={`stump-btn ${day < currentDay ? 'completed' : day === currentDay ? 'current' : 'locked'}`}
                  onClick={() => handleDayClick(day)}
                  disabled={day > currentDay}
                  title={dayNames[day - 1]}
                >
                  <div className="stump-rings">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="ring" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                  <span className="day-num">{day}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-shop" onClick={() => onNavigate('shop')}>
              Shop Furniture
            </button>
            <button 
              className={`btn ${editMode ? 'btn-save' : 'btn-edit'}`}
              onClick={() => {
                if (editMode) {
                  setHomeDirty(false);
                }
                setEditMode(!editMode);
              }}
            >
              {editMode ? 'Save Home' : 'Edit Home'}
            </button>
          </div>

          <div className="unlock-schedule">
            <h3>House Unlock Days</h3>
            <ul>
              <li>Shack: unlocks after Day 1</li>
              <li>Cabin: unlocks after Day 3</li>
              <li>House: unlocks after Day 4</li>
              <li>Mansion: unlocks after Day 5</li>
            </ul>
          </div>
        </div>

        <div className="house-display">
          <div
            className="house-visual"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            <div
              className={`grass-canvas ${editMode ? 'editing' : ''}`}
              style={{ backgroundImage: `url(${grassImg})` }}
              onMouseDown={() => {
                if (editMode) {
                  setSelectedObject(null);
                }
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDropOnGrass}
            >
              {currentHouse && (
                <div
                  className={`house-token ${editMode ? 'draggable' : ''} ${selectedObject?.type === 'house' ? 'selected' : ''}`}
                  style={{ left: `${housePosition.x}px`, top: `${housePosition.y}px`, transform: `scale(${houseScale})` }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (editMode) {
                      setSelectedObject({ type: 'house' });
                    }
                  }}
                  onMouseDown={startDragHouse}
                >
                  <img
                    src={houseImages[currentHouse]}
                    alt={houseLabels[currentHouse] || currentHouse}
                    className="home-house-image"
                    draggable={false}
                  />
                  {editMode && selectedObject?.type === 'house' && (
                    <>
                      <button
                        className="remove-item-btn house-remove-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedObject(null);
                        }}
                        title="Close selection"
                      >
                        x
                      </button>
                      <div
                        className="scale-handle"
                        onMouseDown={startResizeHouse}
                        title="Drag up/down to resize"
                      />
                    </>
                  )}
                </div>
              )}

              {!currentHouse && <div className="empty-house-msg">Finish days to unlock your first house</div>}

              {placedItems.map((item) => (
                <div
                  key={item.id}
                  className={`placed-item ${editMode ? 'draggable' : ''} ${selectedObject?.type === 'item' && selectedObject?.id === item.id ? 'selected' : ''}`}
                  style={{ left: `${item.x}px`, top: `${item.y}px`, transform: `scale(${item.scale || 1})` }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (editMode) {
                      setSelectedObject({ type: 'item', id: item.id });
                    }
                  }}
                  onMouseDown={(event) => startDragItem(event, item.id)}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="home-item-image" draggable={false} />
                  ) : (
                    <span>{item.name}</span>
                  )}
                  {editMode && selectedObject?.type === 'item' && selectedObject?.id === item.id && (
                    <button className="remove-item-btn" onClick={(event) => {
                      event.stopPropagation();
                      removeItem(item.id);
                      setSelectedObject(null);
                      setHomeDirty(true);
                    }}>
                      x
                    </button>
                  )}
                  {editMode && selectedObject?.type === 'item' && selectedObject?.id === item.id && (
                    <div
                      className="scale-handle"
                      onMouseDown={(event) => startResizeItem(event, item.id, item.scale || 1)}
                      title="Drag up/down to resize"
                    />
                  )}
                </div>
              ))}
            </div>

            {editMode && (
              <aside className="inventory-sidebar">
                <h4>Inventory</h4>
                {unplacedItems.length === 0 && <p className="inventory-empty">Buy items from shop, then drag here</p>}
                {unplacedItems.map((item) => (
                  <div
                    key={item.id}
                    className="inventory-pill"
                    draggable
                    onClick={() => placeItemAtRandomSpot(item.id)}
                    onDragStart={(event) => event.dataTransfer.setData('itemId', String(item.id))}
                  >
                    {item.image && <img src={item.image} alt={item.name} className="inventory-pill-image" draggable={false} />}
                    <span>{item.name}</span>
                  </div>
                ))}
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
