import { createContext, useState, useEffect } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [logsEarned, setLogsEarned] = useState(0);
  const [questionsAnsweredToday, setQuestionsAnsweredToday] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [currentHouse, setCurrentHouse] = useState(null);
  const [housePosition, setHousePosition] = useState({ x: 180, y: 120 });
  const [houseScale, setHouseScale] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [homeDirty, setHomeDirty] = useState(false);
  const [homePopup, setHomePopup] = useState('');
  const [unlockedHouses, setUnlockedHouses] = useState([]);

  // Load game state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setCurrentDay(state.currentDay || 1);
        setLogsEarned(state.logsEarned || 0);
        setQuestionsAnsweredToday(state.questionsAnsweredToday || 0);
        setInventory(state.inventory || []);
        setCurrentHouse(state.currentHouse || null);
        setHousePosition(state.housePosition || { x: 180, y: 120 });
        setHouseScale(state.houseScale || 1);
        setUnlockedHouses(state.unlockedHouses || []);
      } catch (error) {
        localStorage.removeItem('gameState');
      }
    }

    setIsHydrated(true);
  }, []);

  // Save game state to localStorage
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const gameState = {
      currentDay,
      logsEarned,
      questionsAnsweredToday,
      inventory,
      currentHouse,
      housePosition,
      houseScale,
      unlockedHouses,
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [isHydrated, currentDay, logsEarned, questionsAnsweredToday, inventory, currentHouse, housePosition, houseScale, unlockedHouses]);

  const addLogs = (amount) => {
    setLogsEarned(prev => prev + amount);
  };

  const completeDay = () => {
    let unlockedHouseName = null;

    if (currentDay < 7) {
      setCurrentDay(prev => prev + 1);
      setQuestionsAnsweredToday(0);

      // Unlock houses based on completed day
      const unlockByCompletedDay = {
        1: 'shack',
        3: 'cabin',
        4: 'house',
        5: 'mansion',
      };

      const houseToUnlock = unlockByCompletedDay[currentDay];
      if (houseToUnlock && !unlockedHouses.includes(houseToUnlock)) {
        unlockedHouseName = houseToUnlock;
        setUnlockedHouses(prev => [...prev, unlockedHouseName]);
        setCurrentHouse(unlockedHouseName);
      }
    }

    return unlockedHouseName;
  };

  const answerQuestion = () => {
    const answered = questionsAnsweredToday + 1;
    setQuestionsAnsweredToday(answered);
    
    if (answered === 20) {
      // Day complete - add 20 logs (1 per question)
      addLogs(20);
      const unlockedHouse = completeDay();
      return { dayComplete: true, unlockedHouse };
    }

    return { dayComplete: false, unlockedHouse: null };
  };

  const buyItem = (item, cost) => {
    if (logsEarned >= cost) {
      setLogsEarned(prev => prev - cost);
      const newItem = {
        id: Date.now(),
        name: item.name,
        image: item.image,
        x: 60,
        y: 60,
        scale: 1,
        placed: false,
      };
      setInventory(prev => [...prev, newItem]);
      return true;
    }
    return false;
  };

  const buyHouse = (houseName, cost) => {
    if (logsEarned >= cost && unlockedHouses.includes(houseName)) {
      setLogsEarned(prev => prev - cost);
      setCurrentHouse(houseName);
      return true;
    }
    return false;
  };

  const updateItemPosition = (itemId, x, y) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, x, y, placed: true } : item
      )
    );
  };

  const updateHousePosition = (x, y) => {
    setHousePosition({ x, y });
  };

  const updateHouseScale = (nextScale) => {
    const clamped = Math.max(0.6, Math.min(1.8, nextScale));
    setHouseScale(clamped);
  };

  const placeInventoryItem = (itemId, x, y) => {
    updateItemPosition(itemId, x, y);
  };

  const updateItemScale = (itemId, nextScale) => {
    const clamped = Math.max(0.5, Math.min(1.8, nextScale));
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, scale: clamped } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, placed: false, x: 60, y: 60 }
          : item
      )
    );
  };

  const value = {
    currentDay,
    setCurrentDay,
    logsEarned,
    setLogsEarned,
    questionsAnsweredToday,
    setQuestionsAnsweredToday,
    answerQuestion,
    inventory,
    setInventory,
    currentHouse,
    setCurrentHouse,
    housePosition,
    setHousePosition,
    houseScale,
    setHouseScale,
    editMode,
    setEditMode,
    homeDirty,
    setHomeDirty,
    homePopup,
    setHomePopup,
    unlockedHouses,
    setUnlockedHouses,
    addLogs,
    completeDay,
    buyItem,
    buyHouse,
    updateItemPosition,
    updateHousePosition,
    updateHouseScale,
    placeInventoryItem,
    updateItemScale,
    removeItem,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
