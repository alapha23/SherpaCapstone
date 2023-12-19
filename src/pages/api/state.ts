import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { StateData, isValidVariableKey } from '@/lib/helper';

// File to store the state data
const dataFilePath = path.join(process.cwd(), 'stateData.json');

// Function to read the state data from the file
function readStateData(): StateData {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If the file does not exist, return an empty object
    return {};
  }
}

// Function to write the state data to the file
function writeStateData(data: StateData): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { conversationId } = req.query;
    const data: StateData = readStateData();
    const state: string = data[conversationId as string]?.state || 'init';
    res.status(200).json({ state });
  } else if (req.method === 'POST') {
    const { conversationId, key, value } = req.body;
    const data: StateData = readStateData();

    if (!isValidVariableKey(key)) {
      res.status(400).json({ error: 'Invalid key' });
      return;
    }

    // Initialize if not exist
    if (!data[conversationId]) {
      data[conversationId] = { state: StateType.Init, variables: {} };
    }

    data[conversationId].variables[key] = value;

    // Determine the new state based on the updated variables
    const { independent_variable, dependent_variable } = data[conversationId].variables;
    if (independent_variable && dependent_variable) {
      data[conversationId].state = StateType.HasBothVariables;
    } else if (dependent_variable) {
      data[conversationId].state = StateType.HasDependentVariable;
    } else if (independent_variable) {
      data[conversationId].state = StateType.HasIndependentVariable;
    } else {
      data[conversationId].state = StateType.Init;
    }

    writeStateData(data);
    res.status(200).json({ message: 'State updated successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
