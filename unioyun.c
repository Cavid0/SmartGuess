// 1-100
// 5 defe xetta 
// ozu secsin
#include <stdio.h>
#include<stdlib.h>
#include<time.h>

int main(){ 
    int random,texmin;
    int max = 5;
    int edilentexmin = 0;

    srand(time(NULL));

    random = rand() % 100;

    printf("1 ile 100 arasinda bir eded texmin girin:");

    while (edilentexmin < max) {
        scanf("%d",&texmin);
        edilentexmin++;
        printf("Texmin etme sayi %d/%d\n",edilentexmin,max);

          if(texmin == random) { 
            printf("Tebrikler,dogru texmin etdiniz!\n");
            break;
         }else if(edilentexmin >=  max){
            printf("Teessufler,dogru ededi tapmadiniz.\nDogru eded: %d\n",random);
         }else if (texmin < random){
            printf("Daha boyuk eded girin.\n");
         }else {
            printf("Daha kicik eded girin.\n");
         }
         if (edilentexmin <  max){
            printf("Tekrar cehd edin:");
         }
    }
    return 0;
}

