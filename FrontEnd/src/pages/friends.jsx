// pages/friends.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserHeader } from "@/components/user-header";
import { Search, UserPlus, UserMinus } from "lucide-react";
import ApiClient from '@/utils/api';

export default function Friends() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [discoveredUsers, setDiscoveredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('following');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get username from sessionStorage (changed from localStorage)
        const storedUsername = sessionStorage.getItem("username");
        if (!storedUsername) {
            router.push('/login');
            return;
        }

        setUsername(storedUsername);

        // Fetch followers and following lists
        fetchFollowers(storedUsername);
        fetchFollowing(storedUsername);
        fetchDiscoveredUsers(storedUsername);
    }, [router]);

    const fetchFollowers = async (user) => {
        try {
            const response = await ApiClient.get(`/friends/followers?username=${user}`);
            // Ensure we always set an array even if API returns null or undefined
            setFollowers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching followers:', error);
            setFollowers([]);
        }
    };

    const fetchFollowing = async (user) => {
        try {
            const response = await ApiClient.get(`/friends/following?username=${user}`);
            // Ensure we always set an array even if API returns null or undefined
            setFollowing(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching following:', error);
            setFollowing([]);
        }
    };

    const fetchDiscoveredUsers = async (user) => {
        setIsLoading(true);
        try {
            const response = await ApiClient.get(`/users/discover?username=${user}`);
            // Ensure we always set an array even if API returns null or undefined
            setDiscoveredUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error discovering users:', error);
            setDiscoveredUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await ApiClient.get(`/users/search?username=${username}&query=${searchQuery}`);
            // Ensure we always set an array even if API returns null or undefined
            setSearchResults(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleFollow = async (friendUsername) => {
        try {
            await ApiClient.post('/users/follow', {
                username: username,
                friendUsername: friendUsername
            });
            // Update lists after following
            fetchFollowing(username);
            fetchDiscoveredUsers(username);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async (friendUsername) => {
        try {
            await ApiClient.post('/users/unfollow', {
                username: username,
                friendUsername: friendUsername
            });
            // Update lists after unfollowing
            fetchFollowing(username);
            fetchDiscoveredUsers(username);
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const isFollowing = (friendUsername) => {
        return following.includes(friendUsername);
    };

    // Safety check for empty arrays
    const safeArray = (arr) => Array.isArray(arr) ? arr : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <UserHeader username={username} />
            <div className="container mx-auto pt-28 pb-10">
                <h1 className="text-3xl font-bold mb-6">Friends</h1>

                <Tabs defaultValue="following" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="mb-4">
                        <TabsTrigger value="following">Following ({safeArray(following).length})</TabsTrigger>
                        <TabsTrigger value="followers">Followers ({safeArray(followers).length})</TabsTrigger>
                        <TabsTrigger value="discover">Discover Users</TabsTrigger>
                        <TabsTrigger value="search">Search</TabsTrigger>
                    </TabsList>

                    <TabsContent value="following">
                        {safeArray(following).length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                You're not following anyone yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {safeArray(following).map((user) => (
                                    <div key={user} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{user}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleUnfollow(user)}
                                            className="flex items-center gap-1"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                            Unfollow
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="followers">
                        {safeArray(followers).length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                You don't have any followers yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {safeArray(followers).map((user) => (
                                    <div key={user} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{user}</p>
                                        </div>
                                        {isFollowing(user) ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleUnfollow(user)}
                                                className="flex items-center gap-1"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                Unfollow
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="default"
                                                onClick={() => handleFollow(user)}
                                                className="flex items-center gap-1"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Follow
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="discover">
                        {isLoading ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">Loading users...</p>
                            </div>
                        ) : safeArray(discoveredUsers).length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No users to discover at the moment.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {safeArray(discoveredUsers).map((user) => (
                                    <div key={user.username || `user-${Math.random()}`} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{user.username}</p>
                                        </div>
                                        <Button
                                            variant="default"
                                            onClick={() => handleFollow(user.username)}
                                            className="flex items-center gap-1"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Follow
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="search">
                        <div className="mb-6">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Search users by username"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="max-w-md"
                                />
                                <Button onClick={handleSearch} disabled={isSearching}>
                                    <Search className="w-4 h-4 mr-2" />
                                    {isSearching ? 'Searching...' : 'Search'}
                                </Button>
                            </div>
                        </div>

                        {safeArray(searchResults).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {safeArray(searchResults).map((user) => (
                                    <div key={user.username || `search-${Math.random()}`} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{user.username}</p>
                                        </div>
                                        {isFollowing(user.username) ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleUnfollow(user.username)}
                                                className="flex items-center gap-1"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                Unfollow
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="default"
                                                onClick={() => handleFollow(user.username)}
                                                className="flex items-center gap-1"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Follow
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : searchQuery && !isSearching ? (
                            <div className="text-center py-10 text-gray-500">
                                No users found matching your search.
                            </div>
                        ) : null}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}