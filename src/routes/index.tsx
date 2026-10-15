import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ChefHat,
  ClipboardList,
  Clock,
  Flame,
  ListOrdered,
  Plus,
  CheckCircle2,
  UtensilsCrossed,
} from "lucide-react";
import { MENU_ITEMS, OrderQueue, type Order } from "@/lib/order-queue";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kitchen Queue — Online Food Order Processing System" },
      {
        name: "description",
        content:
          "A FIFO queue-based food order processing system: place orders, track preparation live, and see completed orders — first in, first served.",
      },
      { property: "og:title", content: "Kitchen Queue — Food Order Processing System" },
      {
        property: "og:description",
        content:
          "Orders are processed strictly in the order received using a queue data structure. Place, track, and complete orders in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const PREP_TIME_MS = 6000;

function Index() {
  // The queue lives in a ref so the FIFO structure is the single source of truth.
  const queueRef = useRef(new OrderQueue());
  const [queued, setQueued] = useState<Order[]>([]);
  const [preparing, setPreparing] = useState<Order | null>(null);
  const [prepProgress, setPrepProgress] = useState(0);
  const [completed, setCompleted] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const nextIdRef = useRef(101);

  const syncQueue = () => setQueued(queueRef.current.toArray());

  // Kitchen loop: pull the front order from the queue, prepare it, complete it.
  useEffect(() => {
    const tick = setInterval(() => {
      if (!preparing) {
        const next = queueRef.current.dequeue();
        if (next) {
          setPreparing({ ...next, status: "preparing" });
          setPrepProgress(0);
          syncQueue();
        }
        return;
      }
      setPrepProgress((p) => {
        const next = p + 100 / (PREP_TIME_MS / 500);
        if (next >= 100) {
          setCompleted((c) => [{ ...preparing, status: "completed" }, ...c]);
          setPreparing(null);
          return 0;
        }
        return next;
      });
    }, 500);
    return () => clearInterval(tick);
  }, [preparing]);

  const toggleItem = (item: string) =>
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );

  const placeOrder = () => {
    if (!customerName.trim() || selectedItems.length === 0) return;
    const order: Order = {
      id: nextIdRef.current++,
      customerName: customerName.trim(),
      items: selectedItems,
      placedAt: Date.now(),
      status: "queued",
    };
    queueRef.current.enqueue(order); // back of the queue — FIFO
    syncQueue();
    setCustomerName("");
    setSelectedItems([]);
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-flame text-flame-foreground">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Kitchen Queue
              </h1>
              <p className="text-xs text-muted-foreground">
                Online Food Order Processing System · FIFO Queue
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm sm:flex">
            <Stat icon={<ListOrdered className="h-4 w-4" />} label="In queue" value={queued.length} />
            <Stat icon={<Flame className="h-4 w-4" />} label="Preparing" value={preparing ? 1 : 0} />
            <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={completed.length} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr]">
        {/* Order placement */}
        <section className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="h-5 w-5 text-flame" />
            Place an Order
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            New orders join the back of the queue and are prepared in the order
            they arrive.
          </p>

          <label className="mt-5 block text-sm font-medium">
            Customer name
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <p className="mt-4 text-sm font-medium">Menu items</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {MENU_ITEMS.map((item) => {
              const active = selectedItems.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className={`rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                    active
                      ? "border-flame bg-flame text-flame-foreground"
                      : "border-border bg-background hover:bg-accent"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            onClick={placeOrder}
            disabled={!customerName.trim() || selectedItems.length === 0}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Enqueue Order
          </button>
        </section>

        {/* Queue / preparing / completed */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Waiting queue */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-gold" />
              Waiting Queue
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {queued.length}
              </span>
            </h3>
            <div className="mt-4 space-y-3">
              {queued.length === 0 && (
                <EmptyNote text="Queue is empty. New orders appear here, front of the line first." />
              )}
              {queued.map((order, i) => (
                <OrderTicket
                  key={order.id}
                  order={order}
                  badge={i === 0 ? "Next up" : `#${i + 1} in line`}
                  badgeClass={i === 0 ? "bg-gold/20 text-foreground" : "bg-secondary text-secondary-foreground"}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </section>

          {/* Preparing */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display flex items-center gap-2 font-semibold">
              <ChefHat className="h-4 w-4 text-flame" />
              Now Preparing
            </h3>
            <div className="mt-4">
              {preparing ? (
                <div className="animate-slide-in rounded-xl border border-flame/40 bg-flame/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-flame">
                      ORDER #{preparing.id}
                    </span>
                    <span className="animate-pulse-soft flex items-center gap-1.5 text-xs font-medium text-flame">
                      <Flame className="h-3.5 w-3.5" /> Cooking
                    </span>
                  </div>
                  <p className="mt-1 font-medium">{preparing.customerName}</p>
                  <ul className="mt-1 text-xs text-muted-foreground">
                    {preparing.items.map((i) => (
                      <li key={i}>· {i}</li>
                    ))}
                  </ul>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-flame transition-[width] duration-500"
                      style={{ width: `${prepProgress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-xs text-muted-foreground">
                    {Math.min(100, Math.round(prepProgress))}% ready
                  </p>
                </div>
              ) : (
                <EmptyNote text="The kitchen is idle. It will dequeue the next order automatically." />
              )}
            </div>
          </section>

          {/* Completed */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-display flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-herb" />
              Completed
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {completed.length}
              </span>
            </h3>
            <div className="mt-4 space-y-3">
              {completed.length === 0 && (
                <EmptyNote text="Finished orders will be served here." />
              )}
              {completed.map((order) => (
                <OrderTicket
                  key={order.id}
                  order={order}
                  badge="Served ✓"
                  badgeClass="bg-herb/15 text-herb"
                  formatTime={formatTime}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-8 text-center text-xs text-muted-foreground">
        FIFO principle: the first order enqueued is the first order dequeued for
        preparation — no skipping the line.
      </footer>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>
        {label}: <span className="font-semibold text-foreground">{value}</span>
      </span>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      {text}
    </p>
  );
}

function OrderTicket({
  order,
  badge,
  badgeClass,
  formatTime,
}: {
  order: Order;
  badge: string;
  badgeClass: string;
  formatTime: (ts: number) => string;
}) {
  return (
    <div className="animate-slide-in rounded-xl border border-border bg-background p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold">ORDER #{order.id}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
          {badge}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium">{order.customerName}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
        {order.items.join(", ")}
      </p>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Placed at {formatTime(order.placedAt)}
      </p>
    </div>
  );
}
