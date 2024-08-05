import { Component, inject, OnDestroy } from '@angular/core';
import { ChatMessage, WebSocketService } from '../../service/web-socket.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-socket',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.scss']
})
export class SocketComponent implements OnDestroy {
  private chatService = inject(WebSocketService);
  private messageSubscription: Subscription;
  
  messageInput: string = '';
  userId: string;
  messageList: { message: string; user: string; message_side: string; }[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params["userId"];
    this.chatService.joinRoom("ABC");
    this.listenForMessages();
  }

  sendMessage(): void {
    if (!this.messageInput.trim()) return;

    const chatMessage: ChatMessage = {
      message: this.messageInput,
      user: this.userId
    };
    this.chatService.sendMessage("ABC", chatMessage);
    this.messageInput = '';
  }

  listenForMessages(): void {
    this.messageSubscription = this.chatService.getMessageSubject().subscribe(
      (messages: ChatMessage[]) => {
        this.messageList = messages.map((item: ChatMessage) => ({
          ...item,
          message_side: item.user === this.userId ? 'sender' : 'receiver'
        }));
      },
      error => {
        console.error('Error receiving messages:', error);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
