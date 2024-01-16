#include <stdio.h>
#include <stdlib.h>
int ext_function(){
    return EXIT_SUCCESS + EXIT_FAILURE;
}
void doesNothing(){
    printf("Nothing?!");
}
int main(){
    printf("Hello, World");
    int exte = ext_function();
    doesNothing();
    return EXIT_SUCCESS;
}

