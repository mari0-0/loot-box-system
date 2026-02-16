import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useEffect, useState } from "react";
import { Header, HeroSection, InventorySection, MobileBlocker, OpeningModal, ShopSection, Toast } from "./components";
import BatScrollbar from "./components/BatScrollbar";
import { isMobile } from "./utils/mobile";

import { ANIMATION, CONTRACT_CONFIG, RARITY, TREASURE_BOX } from "./config";

// Generate random particles for effects
const generateParticles = (count, color) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 100,
    y: 50 + (Math.random() - 0.5) * 100,
    tx: (Math.random() - 0.5) * 200,
    color,
    delay: Math.random() * 0.3,
    size: 5 + Math.random() * 10,
  }));
};

function App() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute, isPending: isTxPending } = useSignAndExecuteTransaction();

  // Mobile check
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = isMobile();
      const width = window.innerWidth;
      const isMobileWidth = width <= 768;

      if (isMobileUA || isMobileWidth) {
        setIsMobileDevice(true);
      } else {
        setIsMobileDevice(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // State
  const [balance, setBalance] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [lootBoxes, setLootBoxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [openingState, setOpeningState] = useState(null);
  const [revealedItem, setRevealedItem] = useState(null);
  const [particles, setParticles] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [currentOpeningBox, setCurrentOpeningBox] = useState(null);
  const [treasureBoxFrame, setTreasureBoxFrame] = useState(0);
  const [rarityFilter, setRarityFilter] = useState("all");
  const [showHeader, setShowHeader] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  // Add toast notification
  const addToast = useCallback((message, type = "info", link = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, link }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (!account) return;
    try {
      const bal = await client.getBalance({ owner: account.address });
      setBalance(Number(bal.totalBalance) / 1e9);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  }, [account, client]);

  // Fetch inventory with pagination
  const fetchInventory = useCallback(async () => {
    if (!account) return;
    setIsLoading(true);
    try {
      let allItems = [];
      let hasNextPage = true;
      let cursor = null;

      while (hasNextPage) {
        const response = await client.getOwnedObjects({
          owner: account.address,
          filter: { StructType: CONTRACT_CONFIG.GAME_ITEM_TYPE },
          options: { showContent: true },
          cursor: cursor,
        });

        const items = response.data
          .map(obj => {
            if (obj.data?.content?.fields) {
              const fields = obj.data.content.fields;
              return {
                id: obj.data.objectId,
                name: fields.name,
                rarity: parseInt(fields.rarity),
                power: parseInt(fields.power),
                timestamp: obj.data.version,
              };
            }
            return null;
          })
          .filter(Boolean);

        allItems = [...allItems, ...items];
        hasNextPage = response.hasNextPage;
        cursor = response.nextCursor;
      }

      allItems.sort((a, b) => b.timestamp - a.timestamp);
      setInventory(allItems);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setIsLoading(false);
    }
  }, [account, client]);

  // Fetch loot boxes with pagination
  const fetchLootBoxes = useCallback(async () => {
    if (!account) return;
    try {
      let allBoxes = [];
      let hasNextPage = true;
      let cursor = null;

      while (hasNextPage) {
        const response = await client.getOwnedObjects({
          owner: account.address,
          filter: { StructType: CONTRACT_CONFIG.LOOT_BOX_TYPE },
          options: { showContent: true },
          cursor: cursor,
        });

        const boxes = response.data.map(obj => ({
          id: obj.data.objectId,
          version: obj.data.version,
        }));

        allBoxes = [...allBoxes, ...boxes];
        hasNextPage = response.hasNextPage;
        cursor = response.nextCursor;
      }

      setLootBoxes(allBoxes);
    } catch (err) {
      console.error("Failed to fetch loot boxes:", err);
    }
  }, [account, client]);

  // Purchase loot box
  const purchaseLootBox = useCallback(async (quantity = 1) => {
    if (!account) {
      addToast("Please connect your wallet first", "error");
      return;
    }

    if (quantity < 1 || quantity > 10) {
      addToast("Quantity must be between 1 and 10", "error");
      return;
    }

    setIsPurchasing(true);

    try {
      const tx = new Transaction();
      const boughtBoxes = [];
      for (let i = 0; i < quantity; i++) {
        const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(CONTRACT_CONFIG.LOOT_BOX_PRICE)]);
        const [lootBox] = tx.moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::loot_box::purchase_loot_box`,
          typeArguments: ["0x2::sui::SUI"],
          arguments: [tx.object(CONTRACT_CONFIG.GAME_CONFIG_ID), paymentCoin],
        });
        boughtBoxes.push(lootBox);
      }

      tx.transferObjects(boughtBoxes, account.address);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async result => {
            addToast(quantity === 1 ? "Loot box purchased!" : `${quantity} loot boxes purchased!`, "success");
            await fetchBalance();
            setTimeout(fetchLootBoxes, 1000);
          },
          onError: error => {
            console.error("Purchase failed:", error);
            addToast(`Purchase failed: ${error.message}`, "error");
          },
        },
      );
    } catch (err) {
      console.error("Purchase error:", err);
      addToast("Failed to create transaction", "error");
    } finally {
      setIsPurchasing(false);
    }
  }, [account, signAndExecute, addToast, fetchBalance, fetchLootBoxes]);

  // Open single loot box
  const openLootBox = useCallback(
    async lootBox => {
      if (!account) return;

      setCurrentOpeningBox(lootBox);
      setOpeningState("shaking");

      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::loot_box::open_loot_box`,
          typeArguments: ["0x2::sui::SUI"],
          arguments: [
            tx.object(CONTRACT_CONFIG.GAME_CONFIG_ID),
            tx.object(lootBox.id),
            tx.object(CONTRACT_CONFIG.RANDOM_OBJECT),
          ],
        });

        setTimeout(() => setOpeningState("intense"), ANIMATION.SHAKE_DURATION);

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: async result => {
              setOpeningState("revealing-animation");
              let currentFrame = 6;
              const playRemainingAnimation = () => {
                return new Promise(resolve => {
                  const animInterval = setInterval(() => {
                    setTreasureBoxFrame(currentFrame);
                    currentFrame++;
                    if (currentFrame > TREASURE_BOX.FRAMES.length - 1) {
                      clearInterval(animInterval);
                      resolve();
                    }
                  }, TREASURE_BOX.FRAME_DURATION);
                });
              };

              await playRemainingAnimation();

              let newItem = null;
              try {
                // Get transaction data with retry
                let txData = null;
                for (let r = 0; r < 5; r++) {
                  try {
                    txData = await client.getTransactionBlock({
                      digest: result.digest,
                      options: { showEffects: true, showEvents: true, showObjectChanges: true },
                    });
                    if (txData) break;
                  } catch (e) {
                    await new Promise(res => setTimeout(res, 500));
                  }
                }

                if (txData && txData.events && txData.events.length > 0) {
                  const openEvent = txData.events.find(e => e.type.includes("LootBoxOpened"));
                  if (openEvent && openEvent.parsedJson) {
                    const data = openEvent.parsedJson;
                    const rarity = Number(data.rarity);
                    newItem = {
                      id: data.item_id,
                      name: ["Common Sword", "Rare Blade", "Epic Weapon", "Legendary Artifact"][rarity],
                      rarity,
                      power: Number(data.power),
                    };
                  }
                }

                if (!newItem && txData?.objectChanges) {
                  const created = txData.objectChanges.find(c => c.type === "created" && c.objectType?.includes("GameItem"));
                  if (created) {
                    const obj = await client.getObject({ id: created.objectId, options: { showContent: true } });
                    if (obj.data?.content?.fields) {
                      const f = obj.data.content.fields;
                      newItem = { id: created.objectId, name: f.name, rarity: Number(f.rarity), power: Number(f.power) };
                    }
                  }
                }
              } catch (err) {
                console.error("Error fetching items:", err);
              }

              if (newItem) {
                setParticles(generateParticles(ANIMATION.PARTICLE_COUNT, RARITY[newItem.rarity].color));
                setRevealedItem(newItem);
                setOpeningState("revealing");
              } else {
                addToast("Item opened! Check your inventory.", "success");
                setOpeningState(null);
              }
              fetchBalance();
              fetchLootBoxes();
              fetchInventory();
            },
            onError: error => {
              addToast(`Failed to open: ${error.message}`, "error");
              setOpeningState(null);
            },
          },
        );
      } catch (err) {
        addToast("Failed to start transaction", "error");
        setOpeningState(null);
      }
    },
    [account, client, signAndExecute, addToast, fetchBalance, fetchInventory, fetchLootBoxes]
  );

  // Bulk open loot boxes
  const openMultipleLootBoxes = useCallback(
    async (count = 10) => {
      if (!account) return;

      const boxesToOpen = lootBoxes.slice(0, Math.min(count, lootBoxes.length));
      if (boxesToOpen.length === 0) {
        addToast("No loot boxes to open", "error");
        return;
      }

      setOpeningState("shaking");

      try {
        setTimeout(() => setOpeningState("intense"), ANIMATION.SHAKE_DURATION);
        await new Promise(resolve => setTimeout(resolve, ANIMATION.SHAKE_DURATION + ANIMATION.INTENSE_SHAKE_DURATION));

        setOpeningState("revealing-animation");
        let currentFrame = 6;
        const playRemaining = () => {
          return new Promise(resolve => {
            const interval = setInterval(() => {
              setTreasureBoxFrame(currentFrame);
              currentFrame++;
              if (currentFrame > TREASURE_BOX.FRAMES.length - 1) {
                clearInterval(interval);
                resolve();
              }
            }, TREASURE_BOX.FRAME_DURATION);
          });
        };

        await playRemaining();

        const newItems = [];
        let successCount = 0;

        for (let i = 0; i < boxesToOpen.length; i++) {
          const box = boxesToOpen[i];
          try {
            const tx = new Transaction();
            tx.moveCall({
              target: `${CONTRACT_CONFIG.PACKAGE_ID}::loot_box::open_loot_box`,
              typeArguments: ["0x2::sui::SUI"],
              arguments: [
                tx.object(CONTRACT_CONFIG.GAME_CONFIG_ID),
                tx.object(box.id),
                tx.object(CONTRACT_CONFIG.RANDOM_OBJECT),
              ],
            });

            const result = await new Promise((resolve, reject) => {
              signAndExecute({ transaction: tx }, { onSuccess: resolve, onError: reject });
            });

            // Fetch result with retry
            let txData = null;
            for (let r = 0; r < 5; r++) {
              try {
                txData = await client.getTransactionBlock({
                  digest: result.digest,
                  options: { showEffects: true, showEvents: true, showObjectChanges: true },
                });
                if (txData) break;
              } catch (e) {
                await new Promise(res => setTimeout(res, 500));
              }
            }

            if (txData) {
              let itemFound = false;
              const event = txData.events?.find(e => e.type.includes("LootBoxOpened"));
              if (event?.parsedJson) {
                const data = event.parsedJson;
                const r = Number(data.rarity);
                newItems.push({
                  id: data.item_id,
                  name: ["Common Sword", "Rare Blade", "Epic Weapon", "Legendary Artifact"][r],
                  rarity: r,
                  power: Number(data.power),
                });
                successCount++;
                itemFound = true;
              }

              if (!itemFound && txData.objectChanges) {
                const created = txData.objectChanges.find(c => c.type === "created" && c.objectType?.includes("GameItem"));
                if (created) {
                  const obj = await client.getObject({ id: created.objectId, options: { showContent: true } });
                  if (obj.data?.content?.fields) {
                    const f = obj.data.content.fields;
                    newItems.push({ id: created.objectId, name: f.name, rarity: Number(f.rarity), power: Number(f.power) });
                    successCount++;
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Error with box ${i + 1}:`, err);
          }
          if (i < boxesToOpen.length - 1) await new Promise(r => setTimeout(r, 400));
        }

        if (newItems.length > 0) {
          const maxRarity = Math.max(...newItems.map(it => it.rarity));
          setParticles(generateParticles(ANIMATION.PARTICLE_COUNT * 2, RARITY[maxRarity].color));
          setRevealedItem(newItems);
          setOpeningState("revealing");
          addToast(`Successfully opened ${successCount} boxes!`, "success");
        } else {
          addToast("Completed processing boxes.", "success");
          setOpeningState(null);
        }
        fetchBalance();
        fetchLootBoxes();
        fetchInventory();
      } catch (err) {
        console.error("Bulk open error:", err);
        addToast("Error during bulk opening", "error");
        setOpeningState(null);
      }
    },
    [account, client, signAndExecute, addToast, fetchBalance, fetchInventory, fetchLootBoxes, lootBoxes]
  );

  const closeReveal = () => {
    setOpeningState(null);
    setRevealedItem(null);
    setParticles([]);
    setCurrentOpeningBox(null);
  };

  const openInExplorer = itemId => {
    window.open(`${CONTRACT_CONFIG.EXPLORER_URL}/${itemId}`, "_blank");
  };

  useEffect(() => {
    if (account) {
      fetchBalance();
      fetchInventory();
      fetchLootBoxes();
    } else {
      setBalance(null);
      setInventory([]);
      setLootBoxes([]);
    }
  }, [account, fetchBalance, fetchInventory, fetchLootBoxes]);

  useEffect(() => {
    if (openingState === "shaking" || openingState === "intense") {
      const maxFrame = 5;
      const interval = setInterval(() => {
        setTreasureBoxFrame(prev => (prev >= maxFrame ? maxFrame : prev + 1));
      }, TREASURE_BOX.FRAME_DURATION);
      return () => clearInterval(interval);
    } else if (openingState !== "revealing-animation") {
      setTreasureBoxFrame(0);
    }
  }, [openingState]);

  if (isMobileDevice) return <MobileBlocker />;

  return (
    <div className="min-h-screen flex flex-col">
      <BatScrollbar />
      <Header account={account} balance={balance} isVisible={showHeader} />
      <HeroSection onVideoEnd={() => setShowHeader(true)} />
      <main className="flex-1">
        <ShopSection
          isPurchasing={isPurchasing}
          isTxPending={isTxPending}
          account={account}
          onPurchase={purchaseLootBox}
          quantity={purchaseQuantity}
          setQuantity={setPurchaseQuantity}
        />
        <InventorySection
          lootBoxes={lootBoxes}
          inventory={inventory}
          isLoading={isLoading}
          account={account}
          rarityFilter={rarityFilter}
          onFilterChange={setRarityFilter}
          onOpenLootBox={openLootBox}
          onBulkOpen={openMultipleLootBoxes}
          onItemClick={openInExplorer}
          openingState={openingState}
        />
      </main>
      <OpeningModal
        openingState={openingState}
        treasureBoxFrame={treasureBoxFrame}
        revealedItem={revealedItem}
        particles={particles}
        onClose={closeReveal}
      />
      <Toast toasts={toasts} />
    </div>
  );
}

export default App;
