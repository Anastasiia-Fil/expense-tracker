import React, { useReducer, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Keyboard,
} from "react-native";


const initialState = {
  expenses: [],
  total: 0,
};

// Create an ID without UUID.
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Handle adding and removing expenses.
function expenseReducer(state, action) {
  switch (action.type) {
    case "ADD_EXPENSE":
      return {
        expenses: [...state.expenses, action.payload],
        total: state.total + action.payload.amount,
      };

    case "REMOVE_EXPENSE": {
      const expense = state.expenses.find((item) => item.id === action.payload);

      if (!expense) {
        return state;
      }

      return {
        expenses: state.expenses.filter((item) => item.id !== action.payload),
        total: state.total - expense.amount,
      };
    }

    default:
      return state;
  }
}

export default function App() {
  // Form values using controlled components.
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  // Expense list and total.
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  function addExpense() {
    const cleanDescription = description.trim();
    const cleanAmount = amount.trim().replace(",", ".");

    // Store money as whole cents.
    const amountInCents = Math.round(Number(cleanAmount) * 100);

    if (!cleanDescription) {
      setError("Please enter a description.");
      return;
    }

    // Accept digits with up to two decimal places.
    const validFormat = /^\d+(\.\d{1,2})?$/.test(cleanAmount);

    if (
      !validFormat ||
      !Number.isSafeInteger(amountInCents) ||
      amountInCents <= 0
    ) {
      setError("Enter a valid amount, such as 12.50.");
      return;
    }

    if (!Number.isSafeInteger(state.total + amountInCents)) {
      setError("This amount is too large.");
      return;
    }

    dispatch({
      type: "ADD_EXPENSE",
      payload: {
        id: generateId(),
        description: cleanDescription,
        amount: amountInCents,
      },
    });

    Keyboard.dismiss();

    // Clear the form.
    setDescription("");
    setAmount("");
    setError("");
  }

  function formatMoney(value) {
    return (value / 100).toFixed(2);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>
      <Text style={styles.total}>Total: ${formatMoney(state.total)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Add expense" onPress={addExpense} />

      <FlatList
        data={state.expenses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No expenses yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.expenseRow}>
            <View style={{ flex: 1 }}>
              <Text>{item.description}</Text>
              <Text style={{ color: "#624B80" }}>
                ${formatMoney(item.amount)}
              </Text>
            </View>
            <Button
              title="Delete"
              onPress={() =>
                dispatch({ type: "REMOVE_EXPENSE", payload: item.id })
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 24,
    backgroundColor: "#FAF7FC",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#624B80",
    marginBottom: 12,
  },
  total: {
    fontSize: 22,
    fontWeight: "600",
    color: "#624B80",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8CCE5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E9DFF2",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  error: {
    color: "#A02F49",
    marginBottom: 12,
  },
});
