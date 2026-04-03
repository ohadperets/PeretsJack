// PeretsJack - Blackjack Game
// Complete game logic with strategy tips

class BlackjackGame {
    constructor() {
        this.balance = 100000;
        this.currentBet = 0;
        this.deck = [];
        this.playerHands = [[]]; // Support for split hands
        this.dealerHand = [];
        this.currentHandIndex = 0;
        this.gamePhase = 'betting'; // betting, playing, dealerTurn, ended
        this.insuranceBet = 0;
        this.handsDoubled = [false];
        this.handBets = [0];
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        // Balance
        this.balanceEl = document.getElementById('balance');
        
        // Cards containers
        this.dealerCardsEl = document.getElementById('dealer-cards');
        this.playerCardsEl = document.getElementById('player-cards');
        this.playerHandsContainer = document.getElementById('player-hands-container');
        
        // Scores
        this.dealerScoreEl = document.getElementById('dealer-score');
        this.playerScoreEl = document.getElementById('player-score');
        
        // Betting
        this.bettingArea = document.getElementById('betting-area');
        this.currentBetEl = document.getElementById('current-bet');
        this.chips = document.querySelectorAll('.chip');
        this.clearBetBtn = document.getElementById('clear-bet');
        this.dealBtn = document.getElementById('deal-btn');
        
        // Actions
        this.actionButtons = document.getElementById('action-buttons');
        this.hitBtn = document.getElementById('hit-btn');
        this.standBtn = document.getElementById('stand-btn');
        this.doubleBtn = document.getElementById('double-btn');
        this.splitBtn = document.getElementById('split-btn');
        this.insuranceBtn = document.getElementById('insurance-btn');
        
        // Game result & tip
        this.gameResultEl = document.getElementById('game-result');
        this.strategyTipEl = document.getElementById('strategy-tip');
        this.tipContentEl = document.getElementById('tip-content');
        
        // New game
        this.newGameArea = document.getElementById('new-game-area');
        this.newGameBtn = document.getElementById('new-game-btn');
        
        // Modal
        this.addMoneyModal = document.getElementById('add-money-modal');
        this.addMoneyBtns = document.querySelectorAll('.btn-money');
    }

    attachEventListeners() {
        // Chips
        this.chips.forEach(chip => {
            chip.addEventListener('click', () => this.addToBet(parseInt(chip.dataset.value)));
        });
        
        // Betting buttons
        this.clearBetBtn.addEventListener('click', () => this.clearBet());
        this.dealBtn.addEventListener('click', () => this.deal());
        
        // Action buttons
        this.hitBtn.addEventListener('click', () => this.hit());
        this.standBtn.addEventListener('click', () => this.stand());
        this.doubleBtn.addEventListener('click', () => this.double());
        this.splitBtn.addEventListener('click', () => this.split());
        this.insuranceBtn.addEventListener('click', () => this.insurance());
        
        // New game
        this.newGameBtn.addEventListener('click', () => this.newGame());
        
        // Add money
        this.addMoneyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.addMoney(parseInt(btn.dataset.amount)));
        });
    }

    // Deck Management
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];
        
        // Use 6 decks like in casinos
        for (let d = 0; d < 6; d++) {
            for (let suit of suits) {
                for (let value of values) {
                    this.deck.push({ suit, value });
                }
            }
        }
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    drawCard() {
        if (this.deck.length < 52) {
            this.createDeck();
        }
        return this.deck.pop();
    }

    // Card Value Calculation
    getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.value)) return 10;
        if (card.value === 'A') return 11;
        return parseInt(card.value);
    }

    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            value += this.getCardValue(card);
            if (card.value === 'A') aces++;
        }
        
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }

    isSoftHand(hand) {
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            value += this.getCardValue(card);
            if (card.value === 'A') aces++;
        }
        
        // Check if any ace is counted as 11
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return aces > 0 && value <= 21;
    }

    isBlackjack(hand) {
        return hand.length === 2 && this.calculateHandValue(hand) === 21;
    }

    isPair(hand) {
        if (hand.length !== 2) return false;
        const v1 = this.getCardValue(hand[0]);
        const v2 = this.getCardValue(hand[1]);
        return v1 === v2;
    }

    // Betting
    addToBet(amount) {
        if (this.gamePhase !== 'betting') return;
        if (this.currentBet + amount > this.balance) {
            alert('אין מספיק כסף!');
            return;
        }
        this.currentBet += amount;
        this.updateDisplay();
    }

    clearBet() {
        if (this.gamePhase !== 'betting') return;
        this.currentBet = 0;
        this.updateDisplay();
    }

    // Deal Cards
    deal() {
        if (this.gamePhase !== 'betting') return;
        if (this.currentBet === 0) {
            alert('יש לבחור סכום הימור!');
            return;
        }
        
        // Create deck if needed
        if (this.deck.length < 52) {
            this.createDeck();
        }
        
        // Reset hands
        this.playerHands = [[]];
        this.dealerHand = [];
        this.currentHandIndex = 0;
        this.insuranceBet = 0;
        this.handsDoubled = [false];
        this.handBets = [this.currentBet];
        
        // Deduct bet
        this.balance -= this.currentBet;
        
        // Deal cards
        this.playerHands[0].push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        this.playerHands[0].push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        
        this.gamePhase = 'playing';
        
        this.updateDisplay();
        this.renderCards();
        
        // Check for insurance opportunity
        if (this.dealerHand[0].value === 'A') {
            this.insuranceBtn.disabled = false;
        } else {
            this.insuranceBtn.disabled = true;
        }
        
        // Check for blackjack
        if (this.isBlackjack(this.playerHands[0])) {
            this.gamePhase = 'dealerTurn';
            this.dealerPlay();
            return;
        }
        
        // Check for split opportunity
        this.updateActionButtons();
        this.showStrategyTip();
    }

    // Player Actions
    hit() {
        if (this.gamePhase !== 'playing') return;
        
        const hand = this.playerHands[this.currentHandIndex];
        hand.push(this.drawCard());
        
        this.renderCards();
        
        const value = this.calculateHandValue(hand);
        
        if (value > 21) {
            // Bust
            this.nextHandOrDealerTurn();
        } else if (value === 21) {
            this.nextHandOrDealerTurn();
        } else {
            this.updateActionButtons();
            this.showStrategyTip();
        }
    }

    stand() {
        if (this.gamePhase !== 'playing') return;
        this.nextHandOrDealerTurn();
    }

    double() {
        if (this.gamePhase !== 'playing') return;
        
        const hand = this.playerHands[this.currentHandIndex];
        if (hand.length !== 2) return;
        if (this.balance < this.handBets[this.currentHandIndex]) return;
        
        // Double the bet
        this.balance -= this.handBets[this.currentHandIndex];
        this.handBets[this.currentHandIndex] *= 2;
        this.handsDoubled[this.currentHandIndex] = true;
        
        // Draw one card and stand
        hand.push(this.drawCard());
        this.renderCards();
        this.updateDisplay();
        
        this.nextHandOrDealerTurn();
    }

    split() {
        if (this.gamePhase !== 'playing') return;
        
        const hand = this.playerHands[this.currentHandIndex];
        if (!this.isPair(hand)) return;
        if (this.balance < this.handBets[this.currentHandIndex]) return;
        
        // Create second hand
        const card2 = hand.pop();
        this.playerHands.push([card2]);
        
        // Pay for second hand
        this.balance -= this.handBets[this.currentHandIndex];
        this.handBets.push(this.handBets[this.currentHandIndex]);
        this.handsDoubled.push(false);
        
        // Deal one card to each hand
        hand.push(this.drawCard());
        this.playerHands[this.playerHands.length - 1].push(this.drawCard());
        
        this.renderCards();
        this.updateDisplay();
        this.updateActionButtons();
        this.showStrategyTip();
    }

    insurance() {
        if (this.gamePhase !== 'playing') return;
        if (this.dealerHand[0].value !== 'A') return;
        
        const insuranceAmount = Math.floor(this.currentBet / 2);
        if (this.balance < insuranceAmount) return;
        
        this.balance -= insuranceAmount;
        this.insuranceBet = insuranceAmount;
        this.insuranceBtn.disabled = true;
        
        this.updateDisplay();
    }

    nextHandOrDealerTurn() {
        if (this.currentHandIndex < this.playerHands.length - 1) {
            this.currentHandIndex++;
            this.renderCards();
            this.updateActionButtons();
            this.showStrategyTip();
        } else {
            this.gamePhase = 'dealerTurn';
            this.dealerPlay();
        }
    }

    // Dealer's Turn
    dealerPlay() {
        this.strategyTipEl.classList.add('hidden');
        this.actionButtons.classList.add('hidden');
        
        // Reveal dealer's card
        this.renderCards(true);
        
        // Check all hands for bust
        let allBusted = true;
        for (let hand of this.playerHands) {
            if (this.calculateHandValue(hand) <= 21) {
                allBusted = false;
                break;
            }
        }
        
        if (allBusted) {
            this.endGame();
            return;
        }
        
        // Dealer draws cards
        this.dealerDrawWithDelay();
    }

    dealerDrawWithDelay() {
        const dealerValue = this.calculateHandValue(this.dealerHand);
        
        // Dealer hits on 16 or less, stands on 17+
        // Using soft 17 rule: dealer stands on soft 17
        if (dealerValue < 17 || (dealerValue === 17 && this.isSoftHand(this.dealerHand) && dealerValue < 17)) {
            setTimeout(() => {
                this.dealerHand.push(this.drawCard());
                this.renderCards(true);
                this.dealerDrawWithDelay();
            }, 700);
        } else {
            this.endGame();
        }
    }

    // End Game
    endGame() {
        this.gamePhase = 'ended';
        
        const dealerValue = this.calculateHandValue(this.dealerHand);
        const dealerBlackjack = this.isBlackjack(this.dealerHand);
        const dealerBusted = dealerValue > 21;
        
        let totalWinnings = 0;
        let results = [];
        
        // Check insurance
        if (this.insuranceBet > 0) {
            if (dealerBlackjack) {
                totalWinnings += this.insuranceBet * 3; // 2:1 + original bet
                results.push('ביטוח עבר! +' + (this.insuranceBet * 2).toLocaleString() + ' ₪');
            }
        }
        
        // Check each hand
        for (let i = 0; i < this.playerHands.length; i++) {
            const hand = this.playerHands[i];
            const playerValue = this.calculateHandValue(hand);
            const playerBlackjack = this.isBlackjack(hand) && this.playerHands.length === 1;
            const playerBusted = playerValue > 21;
            const bet = this.handBets[i];
            
            let handResult = '';
            
            if (playerBusted) {
                handResult = 'הפסד (שריפה)';
            } else if (playerBlackjack && !dealerBlackjack) {
                // Blackjack pays 3:2
                const winAmount = bet + Math.floor(bet * 1.5);
                totalWinnings += winAmount;
                handResult = '🎉 בלאק ג\'ק! +' + winAmount.toLocaleString() + ' ₪';
            } else if (dealerBlackjack && !playerBlackjack) {
                handResult = 'הפסד (בלאק ג\'ק לדילר)';
            } else if (dealerBlackjack && playerBlackjack) {
                totalWinnings += bet;
                handResult = 'תיקו (שני בלאק ג\'ק)';
            } else if (dealerBusted) {
                totalWinnings += bet * 2;
                handResult = 'ניצחון (דילר נשרף)! +' + (bet * 2).toLocaleString() + ' ₪';
            } else if (playerValue > dealerValue) {
                totalWinnings += bet * 2;
                handResult = 'ניצחון! +' + (bet * 2).toLocaleString() + ' ₪';
            } else if (playerValue < dealerValue) {
                handResult = 'הפסד';
            } else {
                totalWinnings += bet;
                handResult = 'תיקו - קיבלת חזרה ' + bet.toLocaleString() + ' ₪';
            }
            
            if (this.playerHands.length > 1) {
                results.push('יד ' + (i + 1) + ': ' + handResult);
            } else {
                results.push(handResult);
            }
        }
        
        this.balance += totalWinnings;
        
        // Display result
        let resultClass = 'lose';
        const totalBet = this.handBets.reduce((a, b) => a + b, 0);
        
        if (totalWinnings > totalBet) {
            resultClass = results.some(r => r.includes('בלאק ג\'ק')) ? 'blackjack' : 'win';
        } else if (totalWinnings === totalBet) {
            resultClass = 'push';
        }
        
        this.gameResultEl.className = 'game-result ' + resultClass;
        this.gameResultEl.innerHTML = results.join('<br>');
        this.gameResultEl.classList.remove('hidden');
        
        this.renderCards(true);
        this.updateDisplay();
        
        // Show new game button
        this.newGameArea.classList.remove('hidden');
        this.bettingArea.classList.add('hidden');
        this.actionButtons.classList.add('hidden');
        
        // Check for bankruptcy
        if (this.balance <= 0) {
            setTimeout(() => {
                this.addMoneyModal.classList.remove('hidden');
            }, 1000);
        }
    }

    newGame() {
        this.gamePhase = 'betting';
        this.currentBet = 0;
        this.playerHands = [[]];
        this.dealerHand = [];
        this.currentHandIndex = 0;
        this.insuranceBet = 0;
        this.handsDoubled = [false];
        this.handBets = [0];
        
        this.playerCardsEl.innerHTML = '';
        this.dealerCardsEl.innerHTML = '';
        this.playerHandsContainer.innerHTML = '<div id="player-cards" class="cards-container"></div>';
        this.playerCardsEl = document.getElementById('player-cards');
        
        this.gameResultEl.classList.add('hidden');
        this.strategyTipEl.classList.add('hidden');
        this.newGameArea.classList.add('hidden');
        this.actionButtons.classList.add('hidden');
        this.bettingArea.classList.remove('hidden');
        
        this.dealerScoreEl.textContent = '';
        this.playerScoreEl.textContent = '';
        
        this.updateDisplay();
    }

    addMoney(amount) {
        this.balance += amount;
        this.addMoneyModal.classList.add('hidden');
        this.updateDisplay();
    }

    // Update Action Buttons
    updateActionButtons() {
        const hand = this.playerHands[this.currentHandIndex];
        const canDouble = hand.length === 2 && this.balance >= this.handBets[this.currentHandIndex];
        const canSplit = this.isPair(hand) && this.balance >= this.handBets[this.currentHandIndex] && this.playerHands.length < 4;
        
        this.doubleBtn.disabled = !canDouble;
        this.splitBtn.disabled = !canSplit;
        
        this.bettingArea.classList.add('hidden');
        this.actionButtons.classList.remove('hidden');
    }

    // Render Cards
    renderCards(showDealerHidden = false) {
        // Render dealer cards
        this.dealerCardsEl.innerHTML = '';
        this.dealerHand.forEach((card, index) => {
            if (index === 1 && !showDealerHidden && this.gamePhase !== 'ended') {
                this.dealerCardsEl.innerHTML += this.createCardHTML(null, true);
            } else {
                this.dealerCardsEl.innerHTML += this.createCardHTML(card);
            }
        });
        
        // Dealer score
        if (showDealerHidden || this.gamePhase === 'ended') {
            this.dealerScoreEl.textContent = '(' + this.calculateHandValue(this.dealerHand) + ')';
        } else if (this.dealerHand.length > 0) {
            this.dealerScoreEl.textContent = '(' + this.getCardValue(this.dealerHand[0]) + ')';
        }
        
        // Render player cards
        if (this.playerHands.length === 1) {
            this.playerHandsContainer.innerHTML = '<div id="player-cards" class="cards-container"></div>';
            this.playerCardsEl = document.getElementById('player-cards');
            this.playerHands[0].forEach(card => {
                this.playerCardsEl.innerHTML += this.createCardHTML(card);
            });
            this.playerScoreEl.textContent = this.playerHands[0].length > 0 ? 
                '(' + this.calculateHandValue(this.playerHands[0]) + ')' : '';
        } else {
            // Multiple hands (after split)
            this.playerHandsContainer.innerHTML = '<div class="split-hands-container"></div>';
            const container = this.playerHandsContainer.querySelector('.split-hands-container');
            
            let scoreText = '';
            this.playerHands.forEach((hand, index) => {
                const isActive = index === this.currentHandIndex && this.gamePhase === 'playing';
                let handHTML = `<div class="hand-container ${isActive ? 'active' : ''}">`;
                handHTML += `<div class="hand-label">יד ${index + 1} (${this.calculateHandValue(hand)})</div>`;
                handHTML += '<div class="cards-container">';
                hand.forEach(card => {
                    handHTML += this.createCardHTML(card);
                });
                handHTML += '</div></div>';
                container.innerHTML += handHTML;
                
                if (index > 0) scoreText += ' | ';
                scoreText += this.calculateHandValue(hand);
            });
            this.playerScoreEl.textContent = '(' + scoreText + ')';
        }
    }

    createCardHTML(card, hidden = false) {
        if (hidden) {
            return '<div class="card"><img src="cards/back.png" alt="Card Back"></div>';
        }
        
        // Convert card to file name format
        const suitMap = {
            '♠': 'S',
            '♥': 'H',
            '♦': 'D',
            '♣': 'C'
        };
        
        // Value: A, 2-9, 0 (for 10), J, Q, K
        let valueCode = card.value;
        if (card.value === '10') valueCode = '0';
        
        const suitCode = suitMap[card.suit];
        const cardCode = valueCode + suitCode;
        
        return `
            <div class="card">
                <img src="cards/${cardCode}.png" alt="${card.value} of ${card.suit}">
            </div>
        `;
    }

    // Update Display
    updateDisplay() {
        this.balanceEl.textContent = this.balance.toLocaleString();
        this.currentBetEl.textContent = this.currentBet.toLocaleString();
        
        // Enable/disable deal button
        this.dealBtn.disabled = this.currentBet === 0 || this.gamePhase !== 'betting';
    }

    // Strategy Tips System
    showStrategyTip() {
        const hand = this.playerHands[this.currentHandIndex];
        const playerValue = this.calculateHandValue(hand);
        const dealerCard = this.dealerHand[0];
        const dealerValue = this.getCardValue(dealerCard);
        const isSoft = this.isSoftHand(hand);
        const isPair = this.isPair(hand);
        
        let tip = this.getStrategyTip(hand, playerValue, dealerValue, isSoft, isPair);
        
        this.tipContentEl.textContent = tip;
        this.strategyTipEl.classList.remove('hidden');
    }

    getStrategyTip(hand, playerValue, dealerValue, isSoft, isPair) {
        // Check pairs first
        if (isPair && hand.length === 2) {
            const pairValue = this.getCardValue(hand[0]);
            return this.getPairTip(pairValue, dealerValue);
        }
        
        // Soft hands (with usable Ace)
        if (isSoft) {
            return this.getSoftHandTip(playerValue, dealerValue);
        }
        
        // Hard hands
        return this.getHardHandTip(playerValue, dealerValue);
    }

    getHardHandTip(playerValue, dealerValue) {
        if (playerValue >= 17) {
            return '✋ Stand - עמוד! יש לך ' + playerValue + ', לא כדאי לסכן.';
        }
        
        if (playerValue >= 13 && playerValue <= 16) {
            if (dealerValue >= 2 && dealerValue <= 6) {
                return '✋ Stand - הדילר עלול להישרף עם ' + dealerValue + '. תן לו לקחת סיכון.';
            }
            return '👆 Hit - הדילר חזק עם ' + dealerValue + '. חייב לנסות לשפר.';
        }
        
        if (playerValue === 12) {
            if (dealerValue >= 4 && dealerValue <= 6) {
                return '✋ Stand - הדילר עם ' + dealerValue + ' בסיכון גבוה להישרף.';
            }
            return '👆 Hit - צריך לשפר את היד, הסיכון נמוך.';
        }
        
        if (playerValue === 11) {
            return '💰 Double - הזדמנות מעולה להכפיל! 11 הוא המספר הכי טוב להכפלה.';
        }
        
        if (playerValue === 10) {
            if (dealerValue >= 2 && dealerValue <= 9) {
                return '💰 Double - להכפיל! יתרון סטטיסטי ברור.';
            }
            return '👆 Hit - הדילר חזק מדי להכפלה, פשוט קח קלף.';
        }
        
        if (playerValue === 9) {
            if (dealerValue >= 3 && dealerValue <= 6) {
                return '💰 Double - כדאי להכפיל כשהדילר חלש.';
            }
            return '👆 Hit - לקחת קלף נוסף.';
        }
        
        // 5-8
        return '👆 Hit - חייב לקחת קלפים עם ' + playerValue + '.';
    }

    getSoftHandTip(playerValue, dealerValue) {
        if (playerValue >= 19) {
            return '✋ Stand - יד רכה מעולה! ' + playerValue + ' זה חזק מאוד.';
        }
        
        if (playerValue === 18) {
            if (dealerValue >= 3 && dealerValue <= 6) {
                return '💰 Double - הזדמנות להכפיל על יד רכה 18 מול דילר חלש!';
            }
            if (dealerValue === 2 || dealerValue === 7 || dealerValue === 8) {
                return '✋ Stand - יד רכה 18 מספיק טובה כאן.';
            }
            return '👆 Hit - הדילר חזק, כדאי לנסות לשפר.';
        }
        
        if (playerValue >= 13 && playerValue <= 17) {
            if (dealerValue >= 4 && dealerValue <= 6) {
                return '💰 Double - הדילר חלש! הזדמנות להכפיל על יד רכה.';
            }
            return '👆 Hit - לקחת קלף, יד רכה לא יכולה להישרף מקלף אחד.';
        }
        
        return '👆 Hit - יש אס, אפשר לקחת קלפים בביטחון.';
    }

    getPairTip(pairValue, dealerValue) {
        // Always split Aces and 8s
        if (pairValue === 11) { // Aces
            return '✂️ Split - תמיד לפצל אסים! זו הזדמנות זהב.';
        }
        
        if (pairValue === 8) {
            return '✂️ Split - תמיד לפצל 8! 16 זו היד הכי גרועה.';
        }
        
        // Never split 10s and 5s
        if (pairValue === 10) {
            return '✋ Stand - לעולם לא לפצל 10! 20 זו יד מנצחת.';
        }
        
        if (pairValue === 5) {
            if (dealerValue >= 2 && dealerValue <= 9) {
                return '💰 Double - להתייחס כמו 10, להכפיל!';
            }
            return '👆 Hit - להתייחס כמו 10, לקחת קלף.';
        }
        
        // 9s
        if (pairValue === 9) {
            if ((dealerValue >= 2 && dealerValue <= 6) || dealerValue === 8 || dealerValue === 9) {
                return '✂️ Split - לפצל 9 מול ' + dealerValue + '.';
            }
            return '✋ Stand - 18 זו יד טובה, לא לפצל.';
        }
        
        // 7s
        if (pairValue === 7) {
            if (dealerValue >= 2 && dealerValue <= 7) {
                return '✂️ Split - לפצל 7 מול דילר חלש.';
            }
            return '👆 Hit - הדילר חזק, לא כדאי לפצל.';
        }
        
        // 6s
        if (pairValue === 6) {
            if (dealerValue >= 2 && dealerValue <= 6) {
                return '✂️ Split - לפצל 6 מול דילר חלש.';
            }
            return '👆 Hit - הדילר חזק, לקחת קלף.';
        }
        
        // 4s
        if (pairValue === 4) {
            if (dealerValue === 5 || dealerValue === 6) {
                return '✂️ Split - לפצל 4 רק מול 5-6.';
            }
            return '👆 Hit - לא לפצל, לקחת קלף.';
        }
        
        // 3s and 2s
        if (pairValue === 3 || pairValue === 2) {
            if (dealerValue >= 2 && dealerValue <= 7) {
                return '✂️ Split - לפצל ' + pairValue + ' מול דילר חלש.';
            }
            return '👆 Hit - הדילר חזק, לקחת קלף.';
        }
        
        return '👆 Hit - לקחת קלף נוסף.';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new BlackjackGame();
});
