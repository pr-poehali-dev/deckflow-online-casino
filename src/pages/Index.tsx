import { useState } from "react";
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
import Icon from "@/components/ui/icon";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [demoBalance, setDemoBalance] = useState(10000);
  const [activeTab, setActiveTab] = useState("lobby");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "Игрок1", message: "Привет всем!", time: "20:45" },
    {
      id: 2,
      user: "Система",
      message: "Добро пожаловать в DeckFlow!",
      time: "20:46",
    },
    {
      id: 3,
      user: "Про_Игрок",
      message: "Кто-нибудь играет в покер?",
      time: "20:47",
    },
  ]);

  const gameRooms = [
    {
      id: 1,
      name: "Дурак Классический",
      players: "3/4",
      stake: "100₽",
      type: "durak",
    },
    {
      id: 2,
      name: "Техасский Холдем",
      players: "5/8",
      stake: "500₽",
      type: "poker",
    },
    {
      id: 3,
      name: "Дурак Переводной",
      players: "2/4",
      stake: "50₽",
      type: "durak",
    },
    {
      id: 4,
      name: "Омаха Покер",
      players: "4/6",
      stake: "200₽",
      type: "poker",
    },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleDemo = () => {
    if (demoBalance <= 10000) {
      setDemoBalance(10000);
    }
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
                Авторизуйтесь для игры
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
                    <Input id="email" placeholder="mail@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input id="password" type="password" />
                  </div>
                  <Button
                    className="w-full casino-button"
                    onClick={handleLogin}
                  >
                    Войти
                  </Button>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input id="name" placeholder="Ваше имя" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-reg">Email</Label>
                    <Input id="email-reg" placeholder="mail@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-reg">Пароль</Label>
                    <Input id="password-reg" type="password" />
                  </div>
                  <Button
                    className="w-full casino-button"
                    onClick={handleLogin}
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                  {balance.toLocaleString()}₽
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Gamepad2" className="text-secondary" size={20} />
                <span className="text-sm">{demoBalance.toLocaleString()}₽</span>
                {demoBalance <= 10000 && (
                  <Button size="sm" variant="outline" onClick={handleDemo}>
                    Получить демо
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Icon name="User" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
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
                      className="casino-card hover:glow-effect transition-all cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{room.name}</CardTitle>
                          <Badge
                            variant={
                              room.type === "poker" ? "default" : "secondary"
                            }
                          >
                            {room.type === "poker" ? "Покер" : "Дурак"}
                          </Badge>
                        </div>
                        <CardDescription>
                          <div className="flex items-center justify-between">
                            <span>Игроки: {room.players}</span>
                            <span className="font-semibold text-primary">
                              Ставка: {room.stake}
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full casino-button">
                          Войти в игру
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Игра</Label>
                        <select className="w-full px-3 py-2 bg-input border border-border rounded-md">
                          <option>Дурак классический</option>
                          <option>Дурак переводной</option>
                          <option>Техасский холдем</option>
                          <option>Омаха покер</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ставка</Label>
                        <Input placeholder="100₽" />
                      </div>
                      <div className="space-y-2">
                        <Label>Игроки</Label>
                        <Input placeholder="4" />
                      </div>
                    </div>
                    <Button className="w-full mt-4 casino-button">
                      Создать стол
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="games" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="casino-card">
                    <CardHeader>
                      <CardTitle>Дурак</CardTitle>
                      <CardDescription>
                        Классическая русская игра
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Варианты:
                        </p>
                        <ul className="text-sm space-y-1">
                          <li>• Классический</li>
                          <li>• Переводной</li>
                          <li>• Подкидной</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="casino-card">
                    <CardHeader>
                      <CardTitle>Покер</CardTitle>
                      <CardDescription>
                        Профессиональные турниры
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Варианты:
                        </p>
                        <ul className="text-sm space-y-1">
                          <li>• Техасский холдем</li>
                          <li>• Омаха</li>
                          <li>• Стад</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="casino-card">
                    <CardHeader>
                      <CardTitle>Скоро</CardTitle>
                      <CardDescription>Новые игры в разработке</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Ожидайте:
                        </p>
                        <ul className="text-sm space-y-1">
                          <li>• Блэкджек</li>
                          <li>• Рулетка</li>
                          <li>• Баккара</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
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

          {/* Chat Sidebar */}
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
                  />
                  <Button size="sm" className="casino-button">
                    <Icon name="Send" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
