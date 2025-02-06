// noinspection JSUnresolvedReference

// @ts-expect-error - Ignore the error because eel is not defined
export const eel = window["eel"];

/// Expose the js functions to the Python side
eel.expose(showAlertMessage);

/**
 * This is a demon function that will be exposed to the Python side,
 * so that you can use it in python via `eel.showAlertMessage`.
 */
function showAlertMessage(msg) {
  console.log(msg);
}
