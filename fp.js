// Function to handle game mode selection and redirection
function selectMode(mode) {
    if (mode === "single") {
        setTimeout(function () {
            window.location.href = "sp_op.html"; // Redirect to single-player page
        }, 1000);
    } else if (mode === "two") {
        setTimeout(function () {
            window.location.href = "sp_tp.html"; // Redirect to two-player page
        }, 1000);
    }
}
