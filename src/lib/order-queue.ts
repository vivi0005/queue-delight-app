/**
 * FIFO queue for the Online Food Order Processing System.
 * Orders are enqueued at the back and dequeued from the front,
 * guaranteeing first-come-first-served processing.
 */

export type OrderStatus = "queued" | "preparing" | "completed";

export interface Order {
  id: number;
  customerName: string;
  items: string[];
  placedAt: number;
  status: OrderStatus;
}

export class OrderQueue {
  private items: Order[] = [];

  /** Add an order to the back of the queue. */
  enqueue(order: Order): void {
    this.items.push(order);
  }

  /** Remove and return the order at the front of the queue. */
  dequeue(): Order | undefined {
    return this.items.shift();
  }

  /** Look at the front order without removing it. */
  peek(): Order | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  /** Read-only snapshot of the queue, front first. */
  toArray(): Order[] {
    return [...this.items];
  }
}

export const MENU_ITEMS = [
  "Margherita Pizza",
  "Cheeseburger",
  "Paneer Tikka Wrap",
  "Chicken Biryani",
  "Veg Hakka Noodles",
  "Caesar Salad",
  "Masala Dosa",
  "Pasta Alfredo",
  "French Fries",
  "Chocolate Shake",
] as const;
