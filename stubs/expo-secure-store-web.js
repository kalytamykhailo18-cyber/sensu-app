// Web stub for expo-secure-store — uses localStorage on web
'use strict';

const PREFIX = '__secure_';

async function setItemAsync(key, value) {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch (_e) {}
}

async function getItemAsync(key) {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch (_e) {
    return null;
  }
}

async function deleteItemAsync(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (_e) {}
}

module.exports = { setItemAsync, getItemAsync, deleteItemAsync };
