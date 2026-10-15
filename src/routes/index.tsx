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
  ArrowRight,
  Check,
  Soup,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import burgerImage from "@/assets/burger.jpg";
import pizzaImage from "@/assets/pizza.jpg";
import pastaImage from "@/assets/pasta.jpg";
import logoImage from "@/assets/kitchen-logo.png";
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
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Kitchen Queue cooking pot logo" width={56} height={56} className="h-12 w-12 object-contain" />
            <div><p className="font-display text-xl font-bold">Kitchen Queue<span className="text-primary">.</span></p><p className="text-xs text-muted-foreground">Good food. In good order.</p></div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-herb"><span className="h-2 w-2 rounded-full bg-herb" />Kitchen is open</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        <section className="flex flex-wrap items-end justify-between gap-5 py-8 sm:py-10">
          <div><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-primary"><Sparkles className="h-4 w-4" />Fresh from the kitchen</p><h1 className="font-display text-4xl font-bold sm:text-5xl">Kitchen Queue</h1><p className="mt-3 text-sm text-muted-foreground sm:text-base">A little craving. A great meal. Your order is next.</p></div>
          <div className="flex gap-6 sm:gap-8">
            <Stat icon={<Clock className="h-4 w-4 text-gold" />} label="Waiting" value={queued.length} />
            <Stat icon={<Flame className="h-4 w-4 text-primary" />} label="Cooking" value={preparing ? 1 : 0} />
            <Stat icon={<CheckCircle2 className="h-4 w-4 text-herb" />} label="Served" value={completed.length} />
          </div>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[380px_1fr]">
          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-5"><h2 className="font-display flex items-center gap-2 text-xl font-bold"><ClipboardList className="h-5 w-5 text-primary" />What's your craving?</h2><p className="mt-1 text-xs text-muted-foreground">Made fresh, just for you.</p></div>
            <div className="p-6">
              <label className="block text-sm font-semibold">Customer name<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
              <div className="mb-3 mt-6 flex items-center justify-between"><p className="text-sm font-semibold">On the menu</p><span className="text-xs text-muted-foreground">{selectedItems.length} selected</span></div>
              <div className="grid grid-cols-2 gap-3">
                {MENU_ITEMS.map((item) => {
                  const active = selectedItems.includes(item);
                  const image = item === "Margherita Pizza" ? pizzaImage : item === "Cheeseburger" ? burgerImage : item === "Pasta Alfredo" ? pastaImage : undefined;
                  return <Button key={item} variant="outline" onClick={() => toggleItem(item)} aria-pressed={active} className={`relative h-auto min-h-12 flex-col gap-0 overflow-hidden whitespace-normal rounded-md p-0 text-left shadow-none ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"}`}>
                    {image && <img src={image} alt={item} loading="lazy" width={992} height={672} className="aspect-[1.6] w-full object-cover" />}
                    <span className="flex w-full items-center justify-between gap-1 px-3 py-3 text-xs font-semibold">{item}{active ? <Check className="shrink-0 text-primary" /> : <Plus className="shrink-0 text-muted-foreground" />}</span>
                  </Button>;
                })}
              </div>
              <Button onClick={placeOrder} disabled={!customerName.trim() || selectedItems.length === 0} className="mt-6 h-12 w-full text-sm font-semibold">Enqueue Order<ArrowRight className="h-4 w-4" /></Button>
            </div>
          </section>

          <div>
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[{ image: pizzaImage, title: "Pizza perfection", tone: "bg-rose-soft" }, { image: burgerImage, title: "Burger bliss", tone: "bg-mint-soft" }, { image: pastaImage, title: "Pasta, please", tone: "bg-gold-soft" }].map((dish) => <div key={dish.title} className={`overflow-hidden rounded-lg ${dish.tone}`}><img src={dish.image} alt={dish.title} width={992} height={672} className="aspect-[1.2] w-full object-cover" /><p className="px-2 py-3 text-center font-display text-xs font-bold sm:text-sm">{dish.title}</p></div>)}
            </div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-xl font-bold">Live kitchen</h2><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ListOrdered className="h-3.5 w-3.5" />First in, first served</span></div>
            <div className="grid gap-5 xl:grid-cols-3">
              <section className="min-w-0 border-t-4 border-gold bg-gold-soft/40 px-4 pb-5 pt-4">
                <h3 className="flex items-center gap-2 text-sm font-bold"><Clock className="h-4 w-4 text-gold" />Waiting Queue<span className="ml-auto text-muted-foreground">{queued.length.toString().padStart(2, "0")}</span></h3>
                <div className="mt-5 space-y-3">{queued.length === 0 && <EmptyNote icon={<Clock />} text="No orders in line" detail="Something delicious is on its way." />}{queued.map((order, i) => <OrderTicket key={order.id} order={order} badge={i === 0 ? "Next up" : `#${i + 1} in line`} badgeClass="bg-gold-soft text-foreground" formatTime={formatTime} />)}</div>
              </section>
              <section className="min-w-0 border-t-4 border-primary bg-rose-soft/40 px-4 pb-5 pt-4">
                <h3 className="flex items-center gap-2 text-sm font-bold"><ChefHat className="h-4 w-4 text-primary" />Now Preparing</h3>
                <div className="mt-5">{preparing ? <div className="animate-slide-in rounded-lg border border-primary/30 bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-primary">ORDER #{preparing.id}</span><Flame className="h-4 w-4 animate-pulse-soft text-primary" /></div><p className="mt-2 break-words text-sm font-semibold">{preparing.customerName}</p><p className="mt-1 text-xs text-muted-foreground">{preparing.items.join(", ")}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${prepProgress}%` }} /></div><p className="mt-2 text-xs text-primary">{Math.min(100, Math.round(prepProgress))}% ready</p></div> : <EmptyNote icon={<Soup />} text="Ready to cook" detail="The kitchen is waiting for your order." />}</div>
              </section>
              <section className="min-w-0 border-t-4 border-herb bg-mint-soft/40 px-4 pb-5 pt-4">
                <h3 className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-herb" />Completed<span className="ml-auto text-muted-foreground">{completed.length.toString().padStart(2, "0")}</span></h3>
                <div className="mt-5 space-y-3">{completed.length === 0 && <EmptyNote icon={<UtensilsIcon />} text="Good things take time" detail="Freshly finished orders appear here." />}{completed.map((order) => <OrderTicket key={order.id} order={order} badge="Served ✓" badgeClass="bg-mint-soft text-herb" formatTime={formatTime} />)}</div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground">Kitchen Queue <span className="mx-2 text-primary">·</span> Every order gets its turn. Every meal gets our care.</footer>
    </div>
  );
}

function UtensilsIcon() { return <CheckCircle2 />; }

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
    <div><div className="flex items-center gap-2">{icon}<span className="font-display text-2xl font-bold text-foreground">{value.toString().padStart(2, "0")}</span></div><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>
  );
}

function EmptyNote({ icon, text, detail }: { icon: React.ReactNode; text: string; detail: string }) {
  return <div className="flex min-h-40 flex-col items-center justify-center py-6 text-center"><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-card text-muted-foreground [&_svg]:h-5 [&_svg]:w-5">{icon}</span><p className="text-xs font-semibold">{text}</p><p className="mt-2 max-w-44 text-xs leading-relaxed text-muted-foreground">{detail}</p></div>;
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
    <div className="animate-slide-in rounded-lg border border-border bg-card p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold">ORDER #{order.id}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
          {badge}
        </span>
      </div>
      <p className="mt-1 break-words text-sm font-medium">{order.customerName}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
        {order.items.join(", ")}
      </p>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Placed at {formatTime(order.placedAt)}
      </p>
    </div>
  );
}
