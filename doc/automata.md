## Automata

Finite automata are used to recognize patterns.
The automaton takes a string of symbols as input and reads each symbol. For each symbol read, it performs a state transition. The transition can take the automaton to another state or remain in the same state.
The transition takes the automaton to states that may or may not be final states. If at the end of the input the current state is a final state, the string has been successfully recognized.

Autômatos finitos são usados para reconhecer padrões.
O automato recebe uma string de símbolos como entrada e vai lendo cada símbolo. Para cada símbolo lido ele realiza uma transição de estado. A transição pode levar o automato a outro estado ou permanecer no mesmo.
A transição leva o automato a estados que podem ser estados finais ou não. Se no final da entrada o estado atual for um estado final, a string de símbolos foi interpretada com sucesso.

A finite automaton is a collection of 5-tuple (Q, ∑, δ, q0, F), where:

Q: finite set of states

∑: finite set of the input symbol

q0: initial state

F: finite set of final states

δ: Transition function

Transition function can be defined as:

δ: Q × ∑ → Q  

Finite automata can be represented by input tape and finite control.

Input tape: It is a linear tape having some number of cells. Each input symbol is placed in each cell.

Finite control: The finite control decides the next state on receiving particular input from input tape. The tape reader reads the cells one by one from left to right, and at a time only one input symbol is read.

There are two types of finite automata:

1. DFA(deterministic finite automata)
2. NFA(non-deterministic finite automata)

DFA refers to deterministic finite automata. Deterministic refers to the uniqueness of the computation. In the DFA, the machine goes to one state only for a particular input character. DFA does not accept the null move.

NFA stands for non-deterministic finite automata. It is used to transmit any number of states for a particular input. It can accept the null move.

Some important points about DFA and NFA:

1. Every DFA is NFA, but NFA is not DFA (DFA is a subset of NFA).
2. DFA is used in Lexical Analysis in Compiler.
3. NFA is more of a theoretical concept.

# The idea

Q: finite set of states

∑: finite set of specified input symbol

<span style="text-decoration: overline;">∑</span>: set of unspecified input symbol

q0: initial state

F: finite set of final states

δ: Transition function

δ: Q × ∑ ∪ <span style="text-decoration: overline;">∑</span> → Q