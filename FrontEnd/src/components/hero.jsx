import React, { useState } from 'react';
import Image from 'next/image'; 
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export const Hero = () => (
  <div className="w-full px-10 py-10 pt-20">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-8 items-center lg:grid-cols-2">
        <div className="flex gap-4 flex-col w-full lg:w-auto">
          <div className="flex gap-4 flex-col">
            <h1 className="w-full text-5xl md:text-7xl tracking-tighter text-center lg:text-left font-regular">
              <span className="text-transparent font-medium bg-clip-text bg-gradient-to-br to-[#FED9B7] from-[#F6A4A2] max-w-lg">Memories that <span className='font-bold'>live on</span></span>
            </h1>
            <p className="text-xl pt-4 lg:pt-3 leading-relaxed tracking-tight text-muted-foreground text-center lg:text-left"><span className="max-w-md">
            Parting Gifts is a heartfelt platform designed to preserve and share love, wisdom, and memories.
              Our mission is to help individuals leave meaningful video messages for their loved ones,
              creating a lasting connection that transcends time and space.
              <br />
              More than just a website, it ensures your voice and emotions are always remembered.
              </span></p>
          </div>
          <div className="flex flex-row gap-4 justify-center lg:justify-start lg:pt-2">
            <Button size="lg" className="gap-4" variant="outline">
              Schedule a call <PhoneCall className="w-4 h-4" />
            </Button>
            <Button asChild size="lg" className="gap-4">
                <Link href="/register">
                Sign up today <MoveRight className="w-4 h-4" />
                </Link>
            </Button>
          </div>
        </div>
        <div className="rounded-md shadow-md overflow-hidden">
            <Image
                src="/indeximg1.jpg"
                alt="Friends smiling"
                width={2000}
                height={1000}
            />
        </div>
      </div>
    </div>
  </div>
);