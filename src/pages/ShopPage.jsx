import { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import './ShopPage.css';
import winSound from '../assets/win.MP3';
import chairImg from '../assets/ordinary_items/chair.png';
import benchImg from '../assets/ordinary_items/bench.png';
import bedImg from '../assets/ordinary_items/bed.png';
import boatImg from '../assets/ordinary_items/boat.png';
import cupboardImg from '../assets/ordinary_items/cupboard.png';
import mirrorImg from '../assets/ordinary_items/mirror.png';
import kitchenImg from '../assets/luxury_items/kitchen.png';
import seesawImg from '../assets/luxury_items/seasaw.png';
import carImg from '../assets/luxury_items/car.png';
import treehouseImg from '../assets/luxury_items/treehouse.png';

export const ShopPage = ({ onNavigate }) => {
  const { logsEarned, buyItem, setEditMode, setHomePopup } = useContext(GameContext);
  const [notification, setNotification] = useState('');

  const playWin = () => {
    const audio = new Audio(winSound);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const ordinaryItems = [
    { name: 'Chair', desc: 'A cozy chair for story time!', tag: 'Fun', cost: 5, image: chairImg },
    { name: 'Bench', desc: 'Sit here with your buddies.', tag: 'Buddy', cost: 8, image: benchImg },
    { name: 'Bed', desc: 'Soft bed for sweet dreams.', tag: 'Sleep', cost: 12, image: bedImg },
    { name: 'Boat', desc: 'Tiny boat for pretend trips!', tag: 'Play', cost: 15, image: boatImg },
    { name: 'Cupboard', desc: 'Hide your treasures inside.', tag: 'Store', cost: 18, image: cupboardImg },
    { name: 'Mirror', desc: 'Make funny faces here!', tag: 'Smile', cost: 20, image: mirrorImg },
  ];

  const luxuryItems = [
    { name: 'Kitchen', desc: 'Cook pretend snacks all day!', tag: 'Yum', cost: 25, image: kitchenImg },
    { name: 'Seesaw', desc: 'Bounce up and down with joy!', tag: 'Play', cost: 35, image: seesawImg },
    { name: 'Car', desc: 'Zoom around your dream yard!', tag: 'Zoom', cost: 45, image: carImg },
    { name: 'Treehouse', desc: 'Secret hangout in the trees!', tag: 'Wow', cost: 50, image: treehouseImg },
  ];

  const handleBuyItem = (item) => {
    if (logsEarned >= item.cost) {
      const fullItem = { ...item };
      if (buyItem(fullItem, item.cost)) {
        playWin();
        setEditMode(true);
        setHomePopup(`bought ${item.name.toLowerCase()}!`);
        onNavigate('home');
      }
    } else {
      setNotification(`Not enough logs! Need ${item.cost - logsEarned} more.`);
      setTimeout(() => setNotification(''), 2500);
    }
  };

  const handleBuyLuxuryItem = (item) => {
    if (logsEarned >= item.cost) {
      const fullItem = { ...item };
      if (buyItem(fullItem, item.cost)) {
        playWin();
        setEditMode(true);
        setHomePopup(`bought ${item.name.toLowerCase()}!`);
        onNavigate('home');
      }
    } else {
      setNotification(`Not enough logs! Need ${item.cost - logsEarned} more.`);
      setTimeout(() => setNotification(''), 2500);
    }
  };

  return (
    <div className="shop-page">
      <div className="shop-nav">
        <button className="back-btn" onClick={() => onNavigate('home')}>← Back to Home</button>
        <h1>Shop Furniture</h1>
        <div className="logs-banner">
          <span className="logs-amount">{logsEarned}</span>
          <span className="logs-label">logs available</span>
        </div>
      </div>

      {notification && <div className="notification">{notification}</div>}

      {/* Ordinary Items Section */}
      <section className="shop-section">
        <div className="section-header">
          <h2>Ordinary Items</h2>
          <p className="section-desc">Pick cute things for your home!</p>
        </div>
        <div className="items-row">
          {ordinaryItems.map((item) => (
            <div key={item.name} className={`product-card ${logsEarned >= item.cost ? 'affordable' : 'expensive'}`}>
              <div className="product-image">
                <img src={item.image} alt={item.name} className="item-image" />
                <span className="item-tag">{item.tag}</span>
              </div>
              <div className="product-info">
                <h3>{item.name}</h3>
                <p className="product-desc">{item.desc}</p>
                <div className="product-footer">
                  <span className="price-badge">{item.cost} logs</span>
                  <button 
                    className="buy-btn"
                    onClick={() => handleBuyItem(item)}
                    disabled={logsEarned < item.cost}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Luxury Items Section */}
      <section className="shop-section luxury-section">
        <div className="section-header">
          <h2>Luxury Items</h2>
          <p className="section-desc">Big fun items if you saved lots of logs!</p>
        </div>
        <div className="items-row">
          {luxuryItems.map((item) => (
            <div key={item.name} className={`product-card luxury ${logsEarned >= item.cost ? 'affordable' : 'expensive'}`}>
              <div className="product-image luxury-img">
                <img src={item.image} alt={item.name} className="item-image" />
                <span className="item-tag luxury">{item.tag}</span>
              </div>
              <div className="product-info">
                <h3>{item.name}</h3>
                <p className="product-desc">{item.desc}</p>
                <div className="product-footer">
                  <span className="price-badge luxury">{item.cost} logs</span>
                  <button 
                    className="buy-btn"
                    onClick={() => handleBuyLuxuryItem(item)}
                    disabled={logsEarned < item.cost}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
