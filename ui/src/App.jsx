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
  const [revealedItem, setRevealedItem] = useState(null);
  const [particles, setParticles] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [currentOpeningBox, setCurrentOpeningBox] = useState(null);
  const [treasureBoxFrame, setTreasureBoxFrame] = useState(0);
  const [rarityFilter, setRarityFilter] = useState("all");
  const [showHeader, setShowHeader] = useState(false);

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

      setLootBoxes(boxes);
    } catch (err) {
      console.error("Failed to fetch loot boxes:", err);
    }
  }, [account, client]);

  // Purchase loot box
  const purchaseLootBox = useCallback(async () => {
    if (!account) {
      addToast("Please connect your wallet first", "error");
      return;
    }

    setIsPurchasing(true);

    try {
      const tx = new Transaction();
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(CONTRACT_CONFIG.LOOT_BOX_PRICE)]);

      const [lootBox] = tx.moveCall({
        target: `${CONTRACT_CONFIG.PACKAGE_ID}::loot_box::purchase_loot_box`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [tx.object(CONTRACT_CONFIG.GAME_CONFIG_ID), paymentCoin],
      });

      tx.transferObjects([lootBox], account.address);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async result => {
            console.log("Purchase success:", result);
            const txLink = `${CONTRACT_CONFIG.EXPLORER_URL.replace("/object", "/tx")}/${result.digest}`;
            addToast(`Loot box purchased!`, "success", txLink);
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

        setTimeout(() => {
          setOpeningState("intense");
        }, ANIMATION.SHAKE_DURATION);

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
            },
          },
        );
      } catch (err) {
        console.error("Open error:", err);
        addToast("Failed to create transaction", "error");
        setOpeningState(null);
        setCurrentOpeningBox(null);
      }
    },
    [account, client, signAndExecute, addToast, fetchBalance, fetchInventory, fetchLootBoxes, inventory],
  );

  // Close reveal modal
  const closeReveal = () => {
    setOpeningState(null);
    setRevealedItem(null);
    setParticles([]);
    setCurrentOpeningBox(null);
  };

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
        />

        <InventorySection
          lootBoxes={lootBoxes}
          inventory={inventory}
          isLoading={isLoading}
          account={account}
          rarityFilter={rarityFilter}
          onFilterChange={setRarityFilter}
          onOpenLootBox={openLootBox}
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
