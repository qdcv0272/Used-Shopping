import { useState } from "react";
import { useStore } from "../store/useStore";

export default function Counter() {
  const count = useStore((s) => s.count);
  const inc = useStore((s) => s.inc);
  const dec = useStore((s) => s.dec);
  const reset = useStore((s) => s.reset);
  const setCount = useStore((s) => s.setCount);
  const [input, setInput] = useState("");

  return (
    <div className="counter">
      <h3>Counter</h3>
      <p>Count: {count}</p>
      <div className="counter-controls">
        <button onClick={dec}>-</button>
        <button onClick={inc}>+</button>
        <button onClick={reset}>Reset</button>
      </div>
      <div className="counter-set">
        <input
          className="counter-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Set count"
        />
        <button
          onClick={() => {
            const n = Number(input);
            if (!Number.isNaN(n)) setCount(n);
            setInput("");
          }}
        >
          Set
        </button>
      </div>
    </div>
  );
}
