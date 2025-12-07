# App Flowchart

## Main User Flow

```mermaid
flowchart TD
    Start([App Launch]) --> CheckAuth{Logged In?}
    CheckAuth -->|No| Login[Login Screen]
    CheckAuth -->|Yes| Home[Home - Problem List]

    Login --> AuthChoice{Auth Method}
    AuthChoice -->|Kakao| KakaoAuth[Kakao OAuth]
    AuthChoice -->|Google| GoogleAuth[Google OAuth]
    KakaoAuth --> Home
    GoogleAuth --> Home

    Home --> Search[Search/Filter Problems]
    Search --> ProblemList[Problem List with Tags]
    ProblemList --> SelectProblem[Select Problem]

    SelectProblem --> ProblemDetail[Problem Detail Page]
    ProblemDetail --> ShowInfo[Display Problem Info]
    ShowInfo --> ShowFunctions[Show Available C Functions<br/>e.g., Array, scanf, printf, string.h, etc.]
    ShowFunctions --> CodeEditor[Code Editor]

    CodeEditor --> Coding{User Action}
    Coding -->|Write Code| CodeEditor
    Coding -->|Need Help| AIChatOpen[Open AI Chat]
    Coding -->|Submit| SubmitCode[Submit Code]

    AIChatOpen --> AIChat[AI Chatbot Interface]
    AIChat --> AskQuestion[User Asks Question]
    AskQuestion --> AIResponse[AI Provides Hint/Explanation]
    AIResponse --> BackToCode{Continue?}
    BackToCode -->|More Questions| AskQuestion
    BackToCode -->|Back to Coding| CodeEditor

    SubmitCode --> Judge{Judge System}
    Judge -->|Option 2| BaekjoonAPI[Submit via Baekjoon API]
    Judge -->|Option 3| AppJudge[App Internal Judge]

    BaekjoonAPI --> GetResult[Get Result]
    AppJudge --> GetResult

    GetResult --> GitHubCommit[Auto Commit to GitHub<br/>Regardless of Result]
    GitHubCommit --> ShowResult{Result?}

    ShowResult -->|Correct| Success[Success Message]
    ShowResult -->|Wrong| Fail[Wrong Answer]

    Success --> SaveToHistory[Save to Solved Problems]
    Fail --> SaveToWrong[Save to Wrong Answer Note]

    SaveToHistory --> NextAction{Next Action}
    SaveToWrong --> NextAction

    NextAction -->|Try Another Problem| ProblemList
    NextAction -->|Review Wrong Answers| WrongNoteList[Wrong Answer Note]
    NextAction -->|View My Stats| MyPage[My Page]

    WrongNoteList --> RetryProblem[Select Problem to Retry]
    RetryProblem --> ProblemDetail

    MyPage --> ShowStats[Show Solved Count<br/>GitHub Contributions<br/>Learning Progress]
    ShowStats --> NextAction
```

## AI Chat Interaction Detail

```mermaid
flowchart TD
    UserCoding[User Writing Code] --> NeedHelp{Stuck?}
    NeedHelp -->|Yes| OpenChat[Click AI Chat Button]
    NeedHelp -->|No| Continue[Continue Coding]

    OpenChat --> ChatInterface[AI Chat Interface Opens<br/>Floating or Bottom Sheet]
    ChatInterface --> UserInput[User Types Question]
    UserInput --> Examples["Examples:<br/>- How do I use scanf?<br/>- What's a pointer?<br/>- Hint for this problem?<br/>- Why is my code wrong?"]

    Examples --> AISend[Send to AI]
    AISend --> AIProcess[AI Processes<br/>Based on Context:<br/>- Current Problem<br/>- User's Code<br/>- Question]

    AIProcess --> AIReply[AI Responds with:<br/>1. Concept Explanation<br/>2. Code Approach<br/>3. C Function Usage<br/>4. Example Code<br/>5. Tips]

    AIReply --> UserReads[User Reads Response]
    UserReads --> Satisfied{Satisfied?}

    Satisfied -->|No| UserInput
    Satisfied -->|Yes| CloseChat[Close Chat or Minimize]
    CloseChat --> ApplyLearning[Apply to Code]
    ApplyLearning --> Continue
```

## Problem Solving Detail Flow

```mermaid
flowchart TD
    ProblemPage[Problem Detail Page] --> Layout[Page Layout]

    Layout --> TopSection[Top Section - Fixed]
    TopSection --> ProblemInfo["Problem Info:<br/>- Title<br/>- Description<br/>- Input/Output Format<br/>- Examples<br/>- Constraints"]

    ProblemInfo --> FunctionSection[C Functions Section]
    FunctionSection --> FuncList["Available Functions:<br/>- Array-based solution<br/>- scanf/printf<br/>- string.h functions<br/>- stdlib.h functions<br/>- etc."]

    FuncList --> BottomSection[Bottom Section - Scrollable]
    BottomSection --> EditorArea[Code Editor Area]

    EditorArea --> Toolbar[Toolbar]
    Toolbar --> Tools["Tools:<br/>- AI Chat Button<br/>- Submit Button<br/>- Reset Button<br/>- Function Reference"]

    Tools --> CodeArea[Code Writing Area<br/>CodeMirror/Monaco Editor]
    CodeArea --> Features["Features:<br/>- Syntax Highlighting<br/>- Auto-completion<br/>- Line Numbers<br/>- Error Indicators"]
```

## GitHub Integration Flow

```mermaid
flowchart TD
    Submit[User Submits Code] --> Judging[Code Judging Process]
    Judging --> Result{Get Result}

    Result -->|Any Result| PrepareCommit[Prepare Git Commit]

    PrepareCommit --> CommitData["Commit Data:<br/>- Problem Number<br/>- Problem Title<br/>- Code<br/>- Result (AC/WA/TLE/etc)<br/>- Language (C)<br/>- Timestamp"]

    CommitData --> CheckGitHub{GitHub<br/>Connected?}

    CheckGitHub -->|No| AskConnect[Prompt User to<br/>Connect GitHub]
    CheckGitHub -->|Yes| CreateCommit[Create Commit]

    AskConnect --> UserDecision{User Choice}
    UserDecision -->|Connect| GitHubOAuth[GitHub OAuth]
    UserDecision -->|Skip| SkipCommit[Skip Commit<br/>Save Locally Only]

    GitHubOAuth --> CreateCommit

    CreateCommit --> CommitMsg["Commit Message:<br/>'Solved: [Problem #] Problem Title'<br/>or<br/>'Attempted: [Problem #] Problem Title'"]

    CommitMsg --> PushToRepo[Push to User's<br/>GitHub Repository]
    PushToRepo --> UpdateGrass[GitHub Contribution<br/>Graph Updated]

    UpdateGrass --> NotifyUser[Notify User:<br/>Successfully Committed]
    SkipCommit --> SaveLocal[Save to Local DB]

    NotifyUser --> End([End])
    SaveLocal --> End
```

## Navigation Structure

```mermaid
flowchart TD
    App[App Root] --> BottomNav[Bottom Navigation]

    BottomNav --> Tab1[Home<br/>Problem List]
    BottomNav --> Tab2[Wrong Answers<br/>Retry List]
    BottomNav --> Tab3[My Page<br/>Stats & Settings]

    Tab1 --> Home1[Search & Filter]
    Tab1 --> Home2[Problem Categories]
    Tab1 --> Home3[Difficulty Levels]

    Tab2 --> Wrong1[Unsolved Problems]
    Tab2 --> Wrong2[Attempted But Failed]
    Tab2 --> Wrong3[Need Review]

    Tab3 --> My1[Solved Count]
    Tab3 --> My2[GitHub Stats]
    Tab3 --> My3[Learning Progress]
    Tab3 --> My4[Settings]

    My4 --> Settings["- GitHub Connection<br/>- AI Settings<br/>- Editor Preferences<br/>- Logout"]
```

## Data Flow

```mermaid
flowchart LR
    User[User] --> Frontend[React Native<br/>Frontend]
    Frontend --> Backend[Node.js<br/>Backend API]
    Backend --> DB[(PostgreSQL/<br/>Supabase)]
    Backend --> AIModel[AI Model<br/>Qwen2.5-Coder/<br/>StarCoder2-Korean]
    Backend --> BaekjoonAPI[Baekjoon API<br/>Optional]
    Backend --> GitHubAPI[GitHub API]

    Frontend -.->|OAuth| KakaoAPI[Kakao Login]
    Frontend -.->|OAuth| GoogleAPI[Google Login]

    DB -->|User Data| Backend
    DB -->|Problem Data| Backend
    DB -->|History| Backend

    AIModel -->|Hints & Reviews| Backend
    BaekjoonAPI -->|Judge Results| Backend
    GitHubAPI -->|Commit Status| Backend
```

---

## Key User Journeys

### 1. First Time User
1. Download App → Login (Kakao/Google) → Tutorial → Browse Problems → Select First Problem → Read Problem & Functions → Start Coding → Ask AI for Help → Submit → GitHub Auto-commit → View Result

### 2. Regular User
1. Open App → Check Wrong Answer List → Select Problem to Retry → Review Previous Attempt → Code New Solution → Chat with AI → Submit → GitHub Commit → Success

### 3. Learning Journey
1. Browse Problems by Difficulty → Select Easy Problem → Read Function Suggestions → Try Array Approach → Get Stuck → Ask AI "How to use arrays?" → Implement → Submit → Success → Try Next Problem with Library Function → Compare Approaches

---

*This flowchart provides a comprehensive view of the app's user experience and technical architecture.*
