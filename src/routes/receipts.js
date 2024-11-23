import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const receipts = {}; // storing in memory, not db

router.post("/process", (req, res) => {
  const receipt = req.body;
  const points = calculatePoints(receipt);
  const id = uuidv4();
  receipts[id] = points;
  // returns JSON object containing id for the receipt
  res.json({ id });
});

router.get("/:id/points", (req, res) => {
  const id = req.params.id;
  // returns a JSON object containing the number of points awarded for a specific receipt
  res.json({ points: receipts[id] });
});

function calculatePoints(receipt) {
  let points = 0;

  // Rule 1 - One point for every alphanumeric character in the retailer name
  const retailerPoints = (receipt.retailer.match(/[a-zA-Z0-9]/g) || []).length;
  points += retailerPoints;

  // Rule 2 - 50 points if the total is a round dollar amount
  if (parseFloat(receipt.total) % 1 === 0) {
    points += 50;
  }

  // Rule 3 - 25 points if the total is a multiple of 0.25
  if (parseFloat(receipt.total) % 0.25 === 0) {
    points += 25;
  }

  // Rule 4 - 5 points for every two items
  points += Math.floor(receipt.items.length / 2) * 5;

  // Rule 5 - If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
  receipt.items.forEach((item) => {
    const trimmedLength = item.shortDescription.trim().length;
    if (trimmedLength % 3 === 0) {
      points += Math.ceil(parseFloat(item.price) * 0.2);
    }
  });

  // Rule 6 - 6 points if the day is odd
  const day = parseInt(receipt.purchaseDate.split("-")[2], 10);
  if (day % 2 !== 0) {
    points += 6;
  }

  // Rule 7 - 10 points if time is between 2:00pm and 4:00pm
  const [hour, minute] = receipt.purchaseTime.split(":").map(Number);
  if (hour === 14 || (hour === 15 && minute === 0)) {
    points += 10;
  }

  return points;
}

export default router;
