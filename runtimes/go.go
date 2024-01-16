// main.go
package main

import (
	"fmt"
	"syscall/js"
)

func main() {
	// Define a JavaScript function that can be called from Go
	js.Global().Set("greet", js.FuncOf(greet))

	select {}
}

// Function to be called from JavaScript
func greet(this js.Value, p []js.Value) interface{} {
	message := "Hello, WebAssembly!"
	js.Global().Get("console").Call("log", message)
	fmt.Println("test")
	return js.ValueOf(message)
}
