import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useEffect, useState, useRef } from "react";
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
    console.log("App mounted");
    const checkMobile = () => {
      // Force check for debugging
      const isMobileUA = isMobile();
      const width = window.innerWidth;
      const isMobileWidth = width <= 768;

      console.log("Mobile Check Debug:", {
        isMobileUA,
        width,
        isMobileWidth,
        userAgent: navigator.userAgent
      });

      if (isMobileUA || isMobileWidth) {
        console.log("SETTING IS MOBILE TRUE");
        setIsMobileDevice(true);
      } else {
        console.log("SETTING IS MOBILE FALSE");
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
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const openingAnimationRef = useRef(null);
  const openingTimeoutRef = useRef(null);
  const openingTimeout2Ref = useRef(null);
  const openingResolveRef = useRef(null);
  const isCancelledRef = useRef(false);
  const [revealedItem, setRevealedItem] = useState(null); // Can be single item or array of items
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

  // Fetch inventory (GameItems) from on-chain
  const fetchInventory = useCallback(async () => {
    if (!account) return;
    setIsLoading(true);
    try {
      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: { StructType: CONTRACT_CONFIG.GAME_ITEM_TYPE },
        options: { showContent: true },
      });

      const items = objects.data
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
        .filter(Boolean)
        .sort((a, b) => b.timestamp - a.timestamp);

      setInventory(items);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setIsLoading(false);
    }
  }, [account, client]);

  // Fetch loot boxes from on-chain
  const fetchLootBoxes = useCallback(async () => {
    if (!account) return;
    try {
      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: { StructType: CONTRACT_CONFIG.LOOT_BOX_TYPE },
        options: { showContent: true },
      });

      const boxes = objects.data.map(obj => ({
        id: obj.data.objectId,
      }));

      console.log(`Fetched ${boxes.length} loot boxes`);
      setLootBoxes(boxes);
    } catch (err) {
      console.error("Failed to fetch loot boxes:", err);
    }
  }, [account, client]);

  // Purchase loot box (supports bulk purchase)
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

      // Purchase multiple loot boxes in a single transaction
      const lootBoxes = [];
      for (let i = 0; i < quantity; i++) {
        // Split coins directly from gas for each purchase
        const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(CONTRACT_CONFIG.LOOT_BOX_PRICE)]);

        const [lootBox] = tx.moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::loot_box::purchase_loot_box`,
          typeArguments: ["0x2::sui::SUI"],
          arguments: [tx.object(CONTRACT_CONFIG.GAME_CONFIG_ID), paymentCoin],
        });

        lootBoxes.push(lootBox);
      }

      // Transfer all loot boxes to the user
      tx.transferObjects(lootBoxes, account.address);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async result => {
            console.log("Purchase success:", result);
            const txLink = `${CONTRACT_CONFIG.EXPLORER_URL.replace("/object", "/tx")}/${result.digest}`;
            const message = quantity === 1 ? "Loot box purchased!" : `${quantity} loot boxes purchased!`;
            addToast(message, "success", txLink);
            await fetchBalance();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchLootBoxes();
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

  // Open loot box
  const openLootBox = useCallback(
    async lootBox => {
      if (!account) return;

      setCurrentOpeningBox(lootBox);
      setOpeningState("shaking");
      setIsTransactionPending(false);
      isCancelledRef.current = false;

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

        openingTimeoutRef.current = setTimeout(() => {
          if (!isCancelledRef.current) {
            setOpeningState("intense");
          }
        }, ANIMATION.SHAKE_DURATION);

        // Mark transaction as pending before signing
        setIsTransactionPending(true);

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: async result => {
              console.log("Open success:", result);

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
                const txData = await client.getTransactionBlock({
                  digest: result.digest,
                  options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                  },
                });

                console.log("Transaction details:", txData);

                if (txData.events && txData.events.length > 0) {
                  const openEvent = txData.events.find(e => e.type.includes("LootBoxOpened"));
                  if (openEvent && openEvent.parsedJson) {
                    const data = openEvent.parsedJson;
                    const rarity = Number(data.rarity);
                    const power = Number(data.power);
                    const rarityInfo = RARITY[rarity];
                    const itemNames = ["Common Sword", "Rare Blade", "Epic Weapon", "Legendary Artifact"];
                    newItem = {
                      id: data.item_id,
                      name: itemNames[rarity],
                      rarity,
                      power,
                    };
                    console.log("Parsed from event:", newItem);
                  }
                }

                if (!newItem && txData.objectChanges) {
                  const createdItem = txData.objectChanges.find(
                    change => change.type === "created" && change.objectType?.includes("GameItem"),
                  );
                  if (createdItem) {
                    const itemObj = await client.getObject({
                      id: createdItem.objectId,
                      options: { showContent: true },
                    });
                    if (itemObj.data?.content?.fields) {
                      const fields = itemObj.data.content.fields;
                      newItem = {
                        id: createdItem.objectId,
                        name: fields.name,
                        rarity: Number(fields.rarity),
                        power: Number(fields.power),
                      };
                      console.log("Fetched from object:", newItem);
                    }
                  }
                }
              } catch (err) {
                console.error("Error fetching transaction details:", err);
              }

              if (!newItem) {
                console.log("Falling back to inventory fetch");
                const items = await client.getOwnedObjects({
                  owner: account.address,
                  filter: { StructType: CONTRACT_CONFIG.GAME_ITEM_TYPE },
                  options: { showContent: true },
                });
                if (items.data.length > 0) {
                  for (const obj of items.data) {
                    if (obj.data?.content?.fields) {
                      const objId = obj.data.objectId;
                      const existsInInventory = inventory.some(item => item.id === objId);
                      if (!existsInInventory) {
                        const fields = obj.data.content.fields;
                        newItem = {
                          id: objId,
                          name: fields.name,
                          rarity: Number(fields.rarity),
                          power: Number(fields.power),
                          timestamp: obj.data.version || Date.now() // fallback if needed
                        };
                        console.log("Found new item in inventory:", newItem);
                        break;
                      }
                    }
                  }
                }
              }

              if (newItem) {
                const rarityInfo = RARITY[newItem.rarity];
                setParticles(generateParticles(ANIMATION.PARTICLE_COUNT, rarityInfo.color));
                setRevealedItem(newItem);
                setOpeningState("revealing");

                await fetchLootBoxes();
                await fetchInventory();
                await fetchBalance();
              } else {
                addToast("Item received! Check your inventory.", "success");
                setOpeningState(null);
                setRevealedItem(null);
                setParticles([]);
                setCurrentOpeningBox(null);
                await fetchLootBoxes();
                await fetchInventory();
              }
            },
            onError: error => {
              console.error("Open failed:", error);
              addToast(`Failed to open: ${error.message}`, "error");
              setOpeningState(null);
              setCurrentOpeningBox(null);
              setIsTransactionPending(false);
            },
          },
        );
      } catch (err) {
        console.error("Open error:", err);
        addToast("Failed to create transaction", "error");
        setOpeningState(null);
        setCurrentOpeningBox(null);
        setIsTransactionPending(false);
      }
    },
    [account, client, signAndExecute, addToast, fetchBalance, fetchInventory, fetchLootBoxes, inventory],
  );

  // Open all loot boxes at once in a single transaction
  const openMultipleLootBoxes = useCallback(
    async () => {
      if (!account) return;

      if (lootBoxes.length === 0) {
        addToast("No loot boxes to open", "error");
        return;
      }

      setOpeningState("shaking");
      setIsTransactionPending(false);
      isCancelledRef.current = false;

      try {
        // Show animation - use first timeout ref
        openingTimeoutRef.current = setTimeout(() => {
          if (!isCancelledRef.current) {
            setOpeningState("intense");
          }
        }, ANIMATION.SHAKE_DURATION);

        // Wait for animation to complete - store resolve so cancel can unblock
        await new Promise(resolve => {
          openingResolveRef.current = () => {
            openingResolveRef.current = null;
            resolve();
          };
          openingTimeout2Ref.current = setTimeout(() => {
            openingResolveRef.current = null;
            if (!isCancelledRef.current) {
              resolve();
            }
          }, ANIMATION.SHAKE_DURATION + ANIMATION.INTENSE_SHAKE_DURATION);
        });

        if (isCancelledRef.current) return; // Cancelled

        setOpeningState("revealing-animation");
        let currentFrame = 6;
        const playRemainingAnimation = () => {
          return new Promise(resolve => {
            openingAnimationRef.current = setInterval(() => {
              if (isCancelledRef.current) {
                clearInterval(openingAnimationRef.current);
                openingAnimationRef.current = null;
                resolve();
                return;
              }
              setTreasureBoxFrame(currentFrame);
              currentFrame++;
              if (currentFrame > TREASURE_BOX.FRAMES.length - 1) {
                clearInterval(openingAnimationRef.current);
                openingAnimationRef.current = null;
                resolve();
              }
            }, TREASURE_BOX.FRAME_DURATION);
          });
        };

        await playRemainingAnimation();

        if (isCancelledRef.current) return; // Cancelled

        // Mark transaction as pending - can't cancel after this
        setIsTransactionPending(true);

        // Create a single transaction using bulk_open_loot_boxes
        const tx = new Transaction();

        // Create a vector of loot box objects
        const lootBoxObjects = lootBoxes.map(box => tx.object(box.id));
        const lootBoxVec = tx.makeMoveVec({ 
          type: CONTRACT_CONFIG.LOOT_BOX_TYPE, 
          elements: lootBoxObjects 
        });

        // Call bulk_open_loot_boxes with the vector
        tx.moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::loot_box::bulk_open_loot_boxes`,
          typeArguments: ["0x2::sui::SUI"],
          arguments: [
            tx.object(CONTRACT_CONFIG.GAME_CONFIG_ID),
            lootBoxVec,
            tx.object(CONTRACT_CONFIG.RANDOM_OBJECT),
          ],
        });

        // Execute single transaction with all boxes
        const result = await new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: tx },
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        });

        console.log(`Opened ${lootBoxes.length} boxes in single transaction:`, result);

        // Wait a bit for the transaction to be fully processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get all items from the transaction
        const newItems = [];
        try {
          const txData = await client.getTransactionBlock({
            digest: result.digest,
            options: {
              showEffects: true,
              showEvents: true,
              showObjectChanges: true,
            },
          });

          // Get all items from events (one event per opened box)
          if (txData.events && txData.events.length > 0) {
            const openEvents = txData.events.filter(e => e.type.includes("LootBoxOpened"));
            const itemNames = ["Common Sword", "Rare Blade", "Epic Weapon", "Legendary Artifact"];
            
            for (const openEvent of openEvents) {
              if (openEvent?.parsedJson) {
                const data = openEvent.parsedJson;
                const rarity = Number(data.rarity);
                const power = Number(data.power);
                newItems.push({
                  id: data.item_id,
                  name: itemNames[rarity],
                  rarity,
                  power,
                });
              }
            }
          }

          // Fallback: get from object changes if events didn't work
          if (newItems.length === 0 && txData.objectChanges) {
            const createdItems = txData.objectChanges.filter(
              change => change.type === "created" && change.objectType?.includes("GameItem")
            );
            
            for (const createdItem of createdItems) {
              try {
                const itemObj = await client.getObject({
                  id: createdItem.objectId,
                  options: { showContent: true },
                });
                if (itemObj.data?.content?.fields) {
                  const fields = itemObj.data.content.fields;
                  const rarity = Number(fields.rarity);
                  const itemNames = ["Common Sword", "Rare Blade", "Epic Weapon", "Legendary Artifact"];
                  newItems.push({
                    id: createdItem.objectId,
                    name: itemNames[rarity],
                    rarity,
                    power: Number(fields.power),
                  });
                }
              } catch (err) {
                console.error(`Error fetching item ${createdItem.objectId}:`, err);
              }
            }
          }
        } catch (err) {
          console.error("Error fetching transaction data:", err);
        }

        if (newItems.length > 0) {
          // Generate particles based on the highest rarity
          const highestRarity = Math.max(...newItems.map(item => item.rarity));
          const rarityInfo = RARITY[highestRarity];
          setParticles(generateParticles(ANIMATION.PARTICLE_COUNT * 2, rarityInfo.color));
          setRevealedItem(newItems); // Set as array
          setOpeningState("revealing");

          addToast(`Successfully opened ${newItems.length} boxes!`, "success");

          // Refresh data - wait a bit longer to ensure blockchain state is fully updated
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Fetch in parallel for faster updates
          await Promise.all([
            fetchLootBoxes(),
            fetchInventory(),
            fetchBalance(),
          ]);
          
          console.log("Data refreshed after bulk open");
        } else {
          addToast(`${lootBoxes.length} boxes opened! Check your inventory.`, "success");
          setOpeningState(null);
          setRevealedItem(null);
          setParticles([]);
          
          // Refresh data - wait a bit longer to ensure blockchain state is fully updated
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Fetch in parallel for faster updates
          await Promise.all([
            fetchLootBoxes(),
            fetchInventory(),
            fetchBalance(),
          ]);
          
          console.log("Data refreshed after bulk open (no items parsed)");
        }
      } catch (err) {
        console.error("Bulk open error:", err);
        addToast(`Failed to open boxes: ${err.message}`, "error");
        setOpeningState(null);
        setIsTransactionPending(false);
      }
    },
    [account, client, signAndExecute, addToast, fetchBalance, fetchInventory, fetchLootBoxes, lootBoxes],
  );


  // Close reveal modal
  const closeReveal = () => {
    setOpeningState(null);
    setRevealedItem(null);
    setParticles([]);
    setCurrentOpeningBox(null);
    setIsTransactionPending(false);
    isCancelledRef.current = false;
  };

  // Cancel opening process (only works before transaction is sent)
  const cancelOpening = useCallback(() => {
    if (isTransactionPending) {
      addToast("Transaction already submitted. Cannot cancel.", "error");
      return;
    }

    // Mark as cancelled
    isCancelledRef.current = true;

    // Clear any pending timeouts
    if (openingTimeoutRef.current) {
      clearTimeout(openingTimeoutRef.current);
      openingTimeoutRef.current = null;
    }
    if (openingTimeout2Ref.current) {
      clearTimeout(openingTimeout2Ref.current);
      openingTimeout2Ref.current = null;
    }
    if (openingAnimationRef.current) {
      clearInterval(openingAnimationRef.current);
      openingAnimationRef.current = null;
    }

    // Resolve the waiting Promise so the async flow can exit
    if (openingResolveRef.current) {
      openingResolveRef.current();
      openingResolveRef.current = null;
    }

    setOpeningState(null);
    setRevealedItem(null);
    setParticles([]);
    setCurrentOpeningBox(null);
    setTreasureBoxFrame(0);
    setIsTransactionPending(false);
    addToast("Opening cancelled", "info");
  }, [isTransactionPending, addToast]);

  // Open item in Sui Explorer
  const openInExplorer = itemId => {
    window.open(`${CONTRACT_CONFIG.EXPLORER_URL}/${itemId}`, "_blank");
  };

  // Initial data fetch on account change
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

  // Treasure box animation during opening
  useEffect(() => {
    if (openingState === "shaking" || openingState === "intense") {
      const maxFrame = 5;
      const interval = setInterval(() => {
        setTreasureBoxFrame(prev => {
          if (prev >= maxFrame) {
            return maxFrame;
          }
          return prev + 1;
        });
      }, TREASURE_BOX.FRAME_DURATION);
      return () => clearInterval(interval);
    } else if (openingState !== "revealing-animation") {
      setTreasureBoxFrame(0);
    }
  }, [openingState]);

  // Mobile check: Show blocker if mobile device detected
  if (isMobileDevice) {
    return <MobileBlocker />;
  }

  // Main Desktop Render
  return (
    <div className="min-h-screen flex flex-col">
      <BatScrollbar />
      <Header account={account} balance={balance} isVisible={showHeader} />

      <HeroSection onVideoEnd={() => setShowHeader(true)} />

      <main className="flex-1s">
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
          onCancel={cancelOpening}
          canCancel={!isTransactionPending}
        />

      <Toast toasts={toasts} />
    </div>
  );
}

export default App;
