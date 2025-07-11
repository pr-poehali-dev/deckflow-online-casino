import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Icon from "@/components/ui/icon";

// Types
interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  demoBalance: number;
  gameHistory: GameRecord[];
  depositHistory: DepositRecord[];
}

interface GameRecord {
  id: string;
  date: string;
  game: string;
  gameMode: string;
  result: "win" | "lose" | "draw";
  stake: number;
  winnings: number;
  duration: string;
  opponents: string[];
}

interface DepositRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed";
}

interface GameRoom {
  id: string;
  name: string;
  game: "durak" | "poker";
  gameMode: string;
  players: Player[];
  maxPlayers: number;
  stake: number;
  isDemo: boolean;
  status: "waiting" | "playing" | "finished";
}

interface Player {
  id: string;
  username: string;
  isBot: boolean;
  balance: number;
  cards: Card[];
  position: number;
}

interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: string;
  id: string;
}

interface GameState {
  gameType: "durak" | "poker";
  gameMode: string;
  players: Player[];
  currentPlayer: number;
  deck: Card[];
  trump: Card | null;
  attackCards: Card[];
  defenseCards: Card[];
  discardPile: Card[];
  gamePhase: "attack" | "defend" | "transfer" | "finished";
  winner: string | null;
}

// Mock data for users
const mockUsers: Record<string, User> = {
  "user@test.com": {
    id: "1",
    username: "TestUser",
    email: "user@test.com",
    balance: 0,
    demoBalance: 10000,
    gameHistory: [
      {
        id: "1",
        date: "2024-01-15 20:30",
        game: "Дурак",
        gameMode: "Классический",
        result: "win",
        stake: 100,
        winnings: 200,
        duration: "12:34",
        opponents: ["Бот1", "Бот2"],
      },
      {
        id: "2",
        date: "2024-01-15 19:15",
        game: "Покер",
        gameMode: "Техасский холдем",
        result: "lose",
        stake: 500,
        winnings: 0,
        duration: "25:18",
        opponents: ["Бот1", "Бот2", "Бот3"],
      },
    ],
    depositHistory: [
      {
        id: "1",
        date: "2024-01-15 18:00",
        amount: 1000,
        method: "Карта",
        status: "completed",
      },
    ],
  },
};

// Game logic helpers
const createDeck = (): Card[] => {
  const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const deck: Card[] = [];

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    });
  });

  return deck.sort(() => Math.random() - 0.5);
};

const createBot = (position: number): Player => ({
  id: `bot-${position}`,
  username: `Бот${position}`,
  isBot: true,
  balance: 10000,
  cards: [],
  position,
});

const gameRoomTemplates = [
  {
    game: "durak" as const,
    gameMode: "Классический",
    maxPlayers: 4,
    minStake: 50,
  },
  {
    game: "durak" as const,
    gameMode: "Переводной",
    maxPlayers: 4,
    minStake: 100,
  },
  {
    game: "durak" as const,
    gameMode: "Подкидной",
    maxPlayers: 6,
    minStake: 75,
  },
  {
    game: "poker" as const,
    gameMode: "Техасский холдем",
    maxPlayers: 8,
    minStake: 200,
  },
  { game: "poker" as const, gameMode: "Омаха", maxPlayers: 6, minStake: 300 },
];

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [activeTab, setActiveTab] = useState("lobby");
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [newRoom, setNewRoom] = useState({
    game: "durak" as const,
    gameMode: "Классический",
    stake: 100,
    maxPlayers: 4,
    isDemo: false,
  });
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; user: string; message: string; time: string }>
  >([]);
  const [newMessage, setNewMessage] = useState("");

  // Authentication
  const handleLogin = () => {
    if (loginEmail && loginPassword) {
      const user = mockUsers[loginEmail];
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setChatMessages([
          {
            id: "1",
            user: "Система",
            message: `Добро пожаловать, ${user.username}!`,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    }
  };

  const handleRegister = () => {
    if (registerData.username && registerData.email && registerData.password) {
      const newUser: User = {
        id: Date.now().toString(),
        username: registerData.username,
        email: registerData.email,
        balance: 0,
        demoBalance: 10000,
        gameHistory: [],
        depositHistory: [],
      };
      mockUsers[registerData.email] = newUser;
      setCurrentUser(newUser);
      setIsLoggedIn(true);
    }
  };

  const handleDemo = () => {
    if (currentUser && currentUser.demoBalance < 10000) {
      setCurrentUser({
        ...currentUser,
        demoBalance: 10000,
      });
    }
  };

  // Game room management
  const createGameRoom = () => {
    const room: GameRoom = {
      id: Date.now().toString(),
      name: `${newRoom.game === "durak" ? "Дурак" : "Покер"} ${newRoom.gameMode}`,
      game: newRoom.game,
      gameMode: newRoom.gameMode,
      players: [],
      maxPlayers: newRoom.maxPlayers,
      stake: newRoom.stake,
      isDemo: newRoom.isDemo,
      status: "waiting",
    };

    if (newRoom.isDemo) {
      // Fill with bots
      for (let i = 1; i < newRoom.maxPlayers; i++) {
        room.players.push(createBot(i));
      }
    }

    setGameRooms((prev) => [...prev, room]);
    setShowCreateRoom(false);
  };

  const joinRoom = (room: GameRoom) => {
    if (!currentUser) return;

    const requiredBalance = room.isDemo
      ? currentUser.demoBalance
      : currentUser.balance;
    if (requiredBalance < room.stake) {
      alert(`Недостаточно средств. Требуется ${room.stake}₽`);
      return;
    }

    // Add player to room
    const player: Player = {
      id: currentUser.id,
      username: currentUser.username,
      isBot: false,
      balance: requiredBalance,
      cards: [],
      position: room.players.length,
    };

    const updatedRoom = {
      ...room,
      players: [...room.players, player],
    };

    setGameRooms((prev) =>
      prev.map((r) => (r.id === room.id ? updatedRoom : r)),
    );
    setSelectedRoom(updatedRoom);

    // Start game if room is full
    if (updatedRoom.players.length === updatedRoom.maxPlayers) {
      startGame(updatedRoom);
    }
  };

  const startGame = (room: GameRoom) => {
    const deck = createDeck();
    const cardsPerPlayer = room.game === "durak" ? 6 : 2;

    // Deal cards
    room.players.forEach((player) => {
      player.cards = deck.splice(0, cardsPerPlayer);
    });

    const gameState: GameState = {
      gameType: room.game,
      gameMode: room.gameMode,
      players: room.players,
      currentPlayer: 0,
      deck,
      trump: room.game === "durak" ? deck[0] : null,
      attackCards: [],
      defenseCards: [],
      discardPile: [],
      gamePhase: "attack",
      winner: null,
    };

    setCurrentGame(gameState);
    setActiveTab("game");
  };

  // Game actions
  const playCard = (card: Card) => {
    if (!currentGame || !currentUser) return;

    // Basic card play logic
    const updatedGame = { ...currentGame };
    const currentPlayer = updatedGame.players[updatedGame.currentPlayer];

    if (currentPlayer.id !== currentUser.id) return;

    // Remove card from player's hand
    currentPlayer.cards = currentPlayer.cards.filter((c) => c.id !== card.id);

    if (updatedGame.gamePhase === "attack") {
      updatedGame.attackCards.push(card);
    } else if (updatedGame.gamePhase === "defend") {
      updatedGame.defenseCards.push(card);
    }

    // Simple turn progression
    updatedGame.currentPlayer =
      (updatedGame.currentPlayer + 1) % updatedGame.players.length;

    setCurrentGame(updatedGame);
  };

  // Chat
  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const message = {
      id: Date.now().toString(),
      user: currentUser.username,
      message: newMessage,
      time: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  // Profile component
  const ProfileDialog = () => (
    <Dialog open={showProfile} onOpenChange={setShowProfile}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Профиль пользователя</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="games">История игр</TabsTrigger>
            <TabsTrigger value="deposits">Депозиты</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Баланс</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentUser?.balance.toLocaleString()}₽
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Реальный баланс
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Демо баланс</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentUser?.demoBalance.toLocaleString()}₽
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Для тренировки
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Игр сыграно</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentUser?.gameHistory.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Всего игр</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Игра</TableHead>
                  <TableHead>Режим</TableHead>
                  <TableHead>Результат</TableHead>
                  <TableHead>Ставка</TableHead>
                  <TableHead>Выигрыш</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUser?.gameHistory.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>{game.date}</TableCell>
                    <TableCell>{game.game}</TableCell>
                    <TableCell>{game.gameMode}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          game.result === "win"
                            ? "default"
                            : game.result === "lose"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {game.result === "win"
                          ? "Победа"
                          : game.result === "lose"
                            ? "Поражение"
                            : "Ничья"}
                      </Badge>
                    </TableCell>
                    <TableCell>{game.stake}₽</TableCell>
                    <TableCell>{game.winnings}₽</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="deposits" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Метод</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUser?.depositHistory.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>{deposit.date}</TableCell>
                    <TableCell>{deposit.amount}₽</TableCell>
                    <TableCell>{deposit.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deposit.status === "completed"
                            ? "default"
                            : deposit.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {deposit.status === "completed"
                          ? "Завершен"
                          : deposit.status === "pending"
                            ? "Ожидает"
                            : "Ошибка"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  // Game table component
  const GameTable = () => {
    if (!currentGame) return null;

    const getSuitIcon = (suit: Card["suit"]) => {
      switch (suit) {
        case "hearts":
          return "♥";
        case "diamonds":
          return "♦";
        case "clubs":
          return "♣";
        case "spades":
          return "♠";
      }
    };

    const getSuitColor = (suit: Card["suit"]) => {
      return suit === "hearts" || suit === "diamonds"
        ? "text-red-500"
        : "text-black";
    };

    const currentPlayer = currentGame.players.find(
      (p) => p.id === currentUser?.id,
    );

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {currentGame.gameType === "durak" ? "Дурак" : "Покер"} -{" "}
            {currentGame.gameMode}
          </h2>
          <p className="text-muted-foreground">
            Ходит: {currentGame.players[currentGame.currentPlayer].username}
          </p>
        </div>

        {/* Game table */}
        <div className="bg-card rounded-lg p-6 min-h-[300px] relative">
          {/* Trump card for durak */}
          {currentGame.gameType === "durak" && currentGame.trump && (
            <div className="absolute top-4 left-4">
              <div className="text-sm text-muted-foreground mb-1">Козырь</div>
              <div className="w-12 h-16 bg-white rounded border-2 border-primary flex items-center justify-center">
                <span
                  className={`text-lg ${getSuitColor(currentGame.trump.suit)}`}
                >
                  {getSuitIcon(currentGame.trump.suit)}
                </span>
              </div>
            </div>
          )}

          {/* Attack cards */}
          {currentGame.attackCards.length > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-sm text-muted-foreground mb-2 text-center">
                Атака
              </div>
              <div className="flex space-x-2">
                {currentGame.attackCards.map((card) => (
                  <div
                    key={card.id}
                    className="w-16 h-20 bg-white rounded border-2 border-secondary flex flex-col items-center justify-center"
                  >
                    <span className="text-xs">{card.rank}</span>
                    <span className={`text-lg ${getSuitColor(card.suit)}`}>
                      {getSuitIcon(card.suit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Defense cards */}
          {currentGame.defenseCards.length > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-24">
              <div className="text-sm text-muted-foreground mb-2 text-center">
                Защита
              </div>
              <div className="flex space-x-2">
                {currentGame.defenseCards.map((card) => (
                  <div
                    key={card.id}
                    className="w-16 h-20 bg-white rounded border-2 border-accent flex flex-col items-center justify-center"
                  >
                    <span className="text-xs">{card.rank}</span>
                    <span className={`text-lg ${getSuitColor(card.suit)}`}>
                      {getSuitIcon(card.suit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Players */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {currentGame.players.map((player) => (
                <div
                  key={player.id}
                  className={`p-2 rounded ${player.id === currentUser?.id ? "bg-primary/20" : "bg-muted"}`}
                >
                  <div className="text-sm font-semibold">{player.username}</div>
                  <div className="text-xs text-muted-foreground">
                    Карт: {player.cards.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player's hand */}
        {currentPlayer && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ваши карты</h3>
            <div className="flex flex-wrap gap-2">
              {currentPlayer.cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => playCard(card)}
                  className="w-20 h-28 bg-white rounded border-2 border-border hover:border-primary transition-colors flex flex-col items-center justify-center"
                >
                  <span className="text-sm font-semibold">{card.rank}</span>
                  <span className={`text-2xl ${getSuitColor(card.suit)}`}>
                    {getSuitIcon(card.suit)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => setCurrentGame(null)}>
            Покинуть игру
          </Button>
          <Button>Пас</Button>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20"></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DECKFLOW
            </h1>
            <p className="text-muted-foreground text-lg">
              Премиум казино онлайн
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <Icon name="Spade" className="text-primary" size={24} />
                <Icon name="Crown" className="text-primary" size={24} />
                <Icon name="Gem" className="text-primary" size={24} />
              </div>
            </div>
          </div>

          <Card className="casino-card">
            <CardHeader>
              <CardTitle className="text-center">Вход в казино</CardTitle>
              <CardDescription className="text-center">
                Введите данные для входа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Вход</TabsTrigger>
                  <TabsTrigger value="register">Регистрация</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="user@test.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full casino-button"
                    onClick={handleLogin}
                  >
                    Войти
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Тестовый аккаунт: user@test.com
                  </p>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input
                      id="username"
                      placeholder="Ваше имя"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-reg">Email</Label>
                    <Input
                      id="email-reg"
                      placeholder="mail@example.com"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-reg">Пароль</Label>
                    <Input
                      id="password-reg"
                      type="password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    className="w-full casino-button"
                    onClick={handleRegister}
                  >
                    Создать аккаунт
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentGame) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DECKFLOW
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Coins" className="text-primary" size={20} />
                  <span className="font-semibold">
                    {currentUser?.balance.toLocaleString()}₽
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Gamepad2" className="text-secondary" size={20} />
                  <span className="text-sm">
                    {currentUser?.demoBalance.toLocaleString()}₽
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <GameTable />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DECKFLOW
              </h1>
              <div className="flex items-center space-x-2">
                <Icon name="Crown" className="text-primary" size={20} />
                <span className="text-sm text-muted-foreground">
                  Премиум казино
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="Coins" className="text-primary" size={20} />
                <span className="font-semibold">
                  {currentUser?.balance.toLocaleString()}₽
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Gamepad2" className="text-secondary" size={20} />
                <span className="text-sm">
                  {currentUser?.demoBalance.toLocaleString()}₽
                </span>
                {currentUser && currentUser.demoBalance < 10000 && (
                  <Button size="sm" variant="outline" onClick={handleDemo}>
                    Получить демо
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
              >
                <Icon name="User" size={16} />
                <span className="ml-2">{currentUser?.username}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="lobby">Лобби</TabsTrigger>
                <TabsTrigger value="games">Игры</TabsTrigger>
                <TabsTrigger value="admin">Админ</TabsTrigger>
              </TabsList>

              <TabsContent value="lobby" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameRooms.map((room) => (
                    <Card
                      key={room.id}
                      className="casino-card hover:glow-effect transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{room.name}</CardTitle>
                          <div className="flex space-x-2">
                            <Badge
                              variant={
                                room.game === "poker" ? "default" : "secondary"
                              }
                            >
                              {room.game === "poker" ? "Покер" : "Дурак"}
                            </Badge>
                            {room.isDemo && (
                              <Badge variant="outline">Демо</Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription>
                          <div className="flex items-center justify-between">
                            <span>
                              Игроки: {room.players.length}/{room.maxPlayers}
                            </span>
                            <span className="font-semibold text-primary">
                              Ставка: {room.stake}₽
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="w-full casino-button"
                          onClick={() => joinRoom(room)}
                          disabled={room.players.length >= room.maxPlayers}
                        >
                          {room.players.length >= room.maxPlayers
                            ? "Стол занят"
                            : "Войти в игру"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="casino-card">
                  <CardHeader>
                    <CardTitle>Создать новый стол</CardTitle>
                    <CardDescription>Настройте параметры игры</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Игра</Label>
                        <Select
                          value={newRoom.game}
                          onValueChange={(value: "durak" | "poker") =>
                            setNewRoom((prev) => ({ ...prev, game: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="durak">Дурак</SelectItem>
                            <SelectItem value="poker">Покер</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Режим</Label>
                        <Select
                          value={newRoom.gameMode}
                          onValueChange={(value) =>
                            setNewRoom((prev) => ({ ...prev, gameMode: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {newRoom.game === "durak" ? (
                              <>
                                <SelectItem value="Классический">
                                  Классический
                                </SelectItem>
                                <SelectItem value="Переводной">
                                  Переводной
                                </SelectItem>
                                <SelectItem value="Подкидной">
                                  Подкидной
                                </SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="Техасский холдем">
                                  Техасский холдем
                                </SelectItem>
                                <SelectItem value="Омаха">Омаха</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ставка</Label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={newRoom.stake}
                          onChange={(e) =>
                            setNewRoom((prev) => ({
                              ...prev,
                              stake: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Макс. игроки</Label>
                        <Input
                          type="number"
                          placeholder="4"
                          value={newRoom.maxPlayers}
                          onChange={(e) =>
                            setNewRoom((prev) => ({
                              ...prev,
                              maxPlayers: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Switch
                        id="demo-mode"
                        checked={newRoom.isDemo}
                        onCheckedChange={(checked) =>
                          setNewRoom((prev) => ({ ...prev, isDemo: checked }))
                        }
                      />
                      <Label htmlFor="demo-mode">
                        Демо режим (игра с ботами)
                      </Label>
                    </div>
                    <Button
                      className="w-full mt-4 casino-button"
                      onClick={createGameRoom}
                    >
                      Создать стол
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="games" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameRoomTemplates.map((template, index) => (
                    <Card key={index} className="casino-card">
                      <CardHeader>
                        <CardTitle>
                          {template.game === "durak" ? "Дурак" : "Покер"}
                        </CardTitle>
                        <CardDescription>{template.gameMode}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Игроков: до {template.maxPlayers}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Мин. ставка: {template.minStake}₽
                          </p>
                          <Button
                            className="w-full casino-button"
                            onClick={() => {
                              setNewRoom({
                                game: template.game,
                                gameMode: template.gameMode,
                                stake: template.minStake,
                                maxPlayers: template.maxPlayers,
                                isDemo: false,
                              });
                              createGameRoom();
                            }}
                          >
                            Быстрая игра
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-6">
                <Card className="casino-card">
                  <CardHeader>
                    <CardTitle>Админ панель</CardTitle>
                    <CardDescription>Управление платформой</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20">
                        <div className="text-center">
                          <Icon
                            name="Users"
                            size={24}
                            className="mx-auto mb-2"
                          />
                          <div>Пользователи</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-20">
                        <div className="text-center">
                          <Icon
                            name="BarChart3"
                            size={24}
                            className="mx-auto mb-2"
                          />
                          <div>Статистика</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-20">
                        <div className="text-center">
                          <Icon
                            name="Settings"
                            size={24}
                            className="mx-auto mb-2"
                          />
                          <div>Настройки</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-20">
                        <div className="text-center">
                          <Icon
                            name="Shield"
                            size={24}
                            className="mx-auto mb-2"
                          />
                          <div>Безопасность</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="casino-card h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Общий чат</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-primary">
                            {msg.user}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Написать сообщение..."
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button
                    size="sm"
                    className="casino-button"
                    onClick={sendMessage}
                  >
                    <Icon name="Send" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ProfileDialog />
    </div>
  );
};

export default Index;
