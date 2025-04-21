// Updated user-header.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Menu, MoveRight, X, Users } from "lucide-react";
import Link from "next/link";
import ChatIcon from "../pages/ChatIcon.jsx";

export const UserHeader = ({ username: propUsername }) => {
    const [username, setUsername] = useState(propUsername || "");

    // Get username from sessionStorage if not provided as a prop
    useEffect(() => {
        if (!propUsername && typeof window !== "undefined") {
            const storedUsername = sessionStorage.getItem("username");
            console.log("UserHeader fetched username from sessionStorage:", storedUsername);
            if (storedUsername) {
                setUsername(storedUsername);
            }
        }
    }, [propUsername]);

    const navigationItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            description: "",
        },
        {
            title: "New Memory",
            href: "/new-memory",
            description: "",
        },
    ];

    const [isOpen, setOpen] = useState(false);

    return (
        <header className="w-full z-40 bg-white fixed p-3 shadow-md">
            <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
                <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
                    <NavigationMenu className="flex justify-start items-start">
                        <NavigationMenuList className="flex justify-start gap-4 flex-row">
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    {item.href ? (
                                        <>
                                            <NavigationMenuLink href={item.href}>
                                                <Button variant="ghost">{item.title}</Button>
                                            </NavigationMenuLink>
                                        </>
                                    ) : (
                                        <>
                                            <NavigationMenuTrigger className="font-medium text-sm">
                                                {item.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent className="!w-[450px] p-4">
                                                <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div className="flex flex-col">
                                                            <p className="text-base">{item.title}</p>
                                                            <p className="text-muted-foreground text-sm">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col text-sm h-full justify-end">
                                                        {item.items?.map((subItem) => (
                                                            <NavigationMenuLink
                                                                href={subItem.href}
                                                                key={subItem.title}
                                                                className="flex flex-row justify-between items-center hover:bg-muted py-2 px-4 rounded"
                                                            >
                                                                <span>{subItem.title}</span>
                                                                <MoveRight className="w-4 h-4 text-muted-foreground" />
                                                            </NavigationMenuLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            </NavigationMenuContent>
                                        </>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex lg:justify-center">
                    <img src="/PG-icon.png" alt="Parting Gifts Logo" className="h-12 object-contain" />
                </div>
                <div className="flex justify-end w-full gap-4 items-center">
                    {/* Friends Link */}
                    <Button variant="ghost" asChild>
                        <Link href="/friends">
                            <Users className="w-5 h-5 mr-1" /> Friends
                        </Link>
                    </Button>

                    {/* Chat Icon with username from state */}
                    <div className="mr-2">
                        {username ? (
                            <ChatIcon username={username} />
                        ) : (
                            <>
                                <ChatIcon username="" />
                                <span className="text-xs text-red-500">(No username)</span>
                            </>
                        )}
                    </div>

                    {/* Account Details */}
                    <Button asChild>
                        <Link href="/personal-details">
                            Account Details
                        </Link>
                    </Button>
                </div>
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
                    <Button variant="ghost" onClick={() => setOpen(!isOpen)}>
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    {isOpen && (
                        <div className="absolute top-10 border-t rounded-xl flex flex-col w-full right-0 bg-background shadow-lg py-4 px-2 container gap-8">
                            {navigationItems.map((item) => (
                                <div key={item.title}>
                                    <div className="flex flex-col gap-2">
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                className="flex justify-between items-center"
                                            >
                                                <span className="text-lg">{item.title}</span>
                                                <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                                            </Link>
                                        ) : (
                                            <p className="text-lg">{item.title}</p>
                                        )}
                                        {item.items &&
                                            item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.title}
                                                    href={subItem.href}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {subItem.title}
                                                    </span>
                                                    <MoveRight className="w-4 h-4 stroke-1" />
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            ))}
                            {/* Add Friends link to mobile menu too */}
                            <div>
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="/friends"
                                        className="flex justify-between items-center"
                                    >
                                        <span className="text-lg">Friends</span>
                                        <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};