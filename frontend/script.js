document.addEventListener("DOMContentLoaded", function () {

    console.log("CodeNest Online Compiler is ready!");

    // Smooth scrolling
    const navLinks = document.querySelectorAll(
        '.nav-links a, .start-btn'
    );

    navLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {

            const targetId = link.getAttribute("href");

            if (targetId && targetId.startsWith("#") && targetId.length > 1) {
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    event.preventDefault();

                    targetSection.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }
        });
    });

    // Compiler elements
    const language = document.getElementById("language");
    // Change editor mode based on selected language
    language.addEventListener("change", function () {

        const selectedLanguage = language.value;

        if (selectedLanguage === "c") {
            editor.setOption("mode", "text/x-csrc");
        }

        else if (selectedLanguage === "cpp") {
            editor.setOption("mode", "text/x-c++src");
        }

        else if (selectedLanguage === "java") {
            editor.setOption("mode", "text/x-java");
        }

    });
    const code = document.getElementById("code");
    // Initialize CodeMirror Editor
    const editor = CodeMirror.fromTextArea(code, {
        lineNumbers: true,
        mode: "text/x-csrc",
        theme: "dracula",
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        lineWrapping: true
    });
    const input = document.getElementById("input");
    const runBtn = document.getElementById("runBtn");
    const clearBtn = document.getElementById("clearBtn");
    const resetBtn = document.getElementById("resetBtn");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const output = document.getElementById("output");

    // Run Code button
    runBtn.addEventListener("click", async function () {

        const selectedLanguage = language.value;
        const sourceCode = editor.getValue();
        const customInput = input.value;

        if (!sourceCode.trim()) {
            output.textContent = "Please write some code first!";
            return;
        }

        runBtn.disabled = true;
        runBtn.textContent = "Compiling...";
        output.textContent = "Please wait. Your code is compiling...";

        try {

            const response = await fetch("/api/compile", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    language: selectedLanguage,
                    code: sourceCode,
                    input: customInput
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Compilation failed!");
            }

            

            let resultText = "";

            if (result.status === "Accepted") {
                resultText += "✅ Compilation Successful!\n\n";
            } else {
                resultText += "❌ " + result.status + "\n\n";
            }

            if (result.output) {
               resultText += "Output:\n" + result.output;
            }

            if (result.error) {
               resultText += "\n\nErrors:\n" + result.error;
            }

            if (!result.output && !result.error) {
                resultText += "No output produced.";
            }

            if (result.time !== null && result.time !== undefined) {
                resultText += "\n\nExecution Time: " + result.time + " seconds";
            }

            if (result.memory !== null && result.memory !== undefined) {
                resultText += "\nMemory: " + result.memory + " KB";
            }

            output.textContent = resultText;

        } catch (error) {

            output.textContent = "Error: " + error.message;

        } finally {

            runBtn.disabled = false;
            runBtn.textContent = "Run Code";

        }

    });

    // Clear Code Button
    clearBtn.addEventListener("click", function () {
       editor.setValue("");
    });

    // Reset Button
    resetBtn.addEventListener("click", function () {
        editor.setValue("");
        input.value = "";
        output.textContent = "Your output will appear here...";
    });
    // Copy Code Button
    copyBtn.addEventListener("click", async function () {

        const sourceCode = editor.getValue();

        if (!sourceCode.trim()) {
            output.textContent = "No code available to copy!";
            return;
        }

        try {
            await navigator.clipboard.writeText(sourceCode);

            output.textContent = "Code copied successfully!";

        } catch (error) {
            output.textContent = "Unable to copy code!";
        }

    });
    
    // Download Code Button
    downloadBtn.addEventListener("click", function () {

        const sourceCode = editor.getValue();
        const selectedLanguage = language.value;

        if (!sourceCode.trim()) {
            output.textContent = "No code available to download!";
            return;
        }

        const extensions = {
            c: "c",
            cpp: "cpp",
            java: "java"
        };

        const fileName = "CodeNest." + extensions[selectedLanguage];

        const blob = new Blob([sourceCode], {
            type: "text/plain"
        });

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        link.click();

        URL.revokeObjectURL(link.href);

        output.textContent = fileName + " downloaded successfully!";

    });


});
