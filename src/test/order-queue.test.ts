import { describe, expect, it } from "vitest";
import { OrderQueue, type Order } from "@/lib/order-queue";

const makeOrder = (id: number): Order => ({
  id,
  customerName: `Customer ${id}`,
  items: ["Margherita Pizza"],
  placedAt: id,
  status: "queued",
});

describe("OrderQueue (FIFO)", () => {
  it("dequeues orders in the exact order they were enqueued", () => {
    const q = new OrderQueue();
    q.enqueue(makeOrder(1));
    q.enqueue(makeOrder(2));
    q.enqueue(makeOrder(3));

    expect(q.dequeue()?.id).toBe(1);
    expect(q.dequeue()?.id).toBe(2);
    expect(q.dequeue()?.id).toBe(3);
    expect(q.isEmpty()).toBe(true);
  });

  it("peek returns the front order without removing it", () => {
    const q = new OrderQueue();
    q.enqueue(makeOrder(7));
    q.enqueue(makeOrder(8));

    expect(q.peek()?.id).toBe(7);
    expect(q.size()).toBe(2);
  });
});
