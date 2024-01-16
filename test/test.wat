(module
    (import "console" "log" (func $_Lfunc_end0 (param i32 i32) (result  ))) ;;
    (import "js" "mem" (memory 1)) ;;
    
    (data (i32.const 0) "Hello, Worlldd!!!")

    (func (export "$_Lfunc_exp1")
        i32.const 0
        i32.const 17
        call $_Lfunc_end0
    )

)