import { useState, useEffect } from "react";
import styles from "../styles/Transactions.module.css";

interface Transaction {
  id: number;
  amount: number;
  created_at: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then(setTransactions);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    setAmount("");
    // Refresh data
    const updated = await fetch("/api/transactions").then((res) => res.json());
    setTransactions(updated);
  };

  return (
    <div className={styles.container}>
      <h1>Transactions</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
        <button type="submit">Add Transaction</button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.amount.toFixed(2)}</td>
              <td>{new Date(tx.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
