import React, { useReducer, useState } from "react";
import { View, Text, TextInput, Button,   FlatList, StyleSheet } from "react-native";

// Starting data.
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
  // Form values.
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

    // Clear the form.
    setDescription("");
    setAmount("");
    setError("");
  }

  return (
    <View style={styles.container}>
      <Text>Expense Tracker</Text>

      <Text>Total: ${(state.total / 100).toFixed(2)}</Text>

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

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <Button title="Add Expense" onPress={addExpense} />
            <FlatList
        data={state.expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseRow}>
            <Text>{item.description}</Text>
            <Text>${(item.amount / 100).toFixed(2)}</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#BDB4C7",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    marginTop: 10,
    backgroundColor: "#E9DFF2",
    borderRadius: 8,
  },

  error: {
    color: "#A02F49",
    marginBottom: 10,
  },
});
