import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
plt.rcParams['font.family']='DejaVu Sans'
ann=lambda r,n: sum(1/(1+r)**t for t in range(1,n+1)); gap=459057-282585.33; RP=0.03
yos=list(range(10,20))
pen=[48000*ann(RP,30)/(1+RP)**(20-y) for y in yos]
pen5=[48000*ann(.05,30)/1.05**(20-y) for y in yos]
rem=[gap*ann(.05,20-y) for y in yos]
# crossover by linear interpolation
for i in range(len(yos)-1):
    d0=pen[i]-rem[i]; d1=pen[i+1]-rem[i+1]
    if d0<0<=d1: xc=yos[i]+(-d0)/(d1-d0); yc=pen[i]+(pen[i+1]-pen[i])*(xc-yos[i])
print('cross',xc,yc,[round(p-r) for p,r in zip(pen,rem)])
NAVY='#23628B'; ORG='#C98241'; INK='#1B2A38'; GRID='#E3E6EA'
fig=plt.figure(figsize=(11,6.4),dpi=200)
fig.text(0.06,0.93,'Why staying gets easier: the pension pull',fontsize=18,fontweight='bold',color=INK)
fig.text(0.06,0.885,'Present value at each year of service of staying to 20 | Constant 2026 dollars; pension at 3% real, cash at 5% real',fontsize=10.5,color=INK)
ax=fig.add_axes([0.10,0.24,0.84,0.58])
k=FuncFormatter(lambda v,p:f'${v/1e6:.1f}M' if v>=1e6 else f'${v/1e3:.0f}k')
ax.plot(yos,pen,color=NAVY,lw=2.4,marker='o',ms=6,label='Pension PV preserved by staying (3% real)')
ax.plot(yos,pen5,color='#8C959E',lw=1.4,ls=':',marker='o',ms=3.5,label='Same pension at 5% real (comparison)')
ax.plot(yos,rem,color=ORG,lw=2.4,ls='--',marker='s',ms=6,label='Remaining civilian cash forgone before 20 (PV)')
ax.fill_between(yos,pen,rem,where=[p<r for p,r in zip(pen,rem)],interpolate=True,color=ORG,alpha=0.10)
ax.fill_between(yos,pen,rem,where=[p>=r for p,r in zip(pen,rem)],interpolate=True,color=NAVY,alpha=0.12)
ax.axvline(xc,color='#7A8590',lw=1,ls=':')
ax.annotate(f'Break-even ≈ {xc:.1f} years',xy=(xc,yc),xytext=(xc+0.6,yc+380000),fontsize=11,color=INK,
            arrowprops=dict(arrowstyle='-',color='#7A8590',lw=1))
ax.text(11.3,1000000,'Net cost of staying\n−$663k at 10 years',fontsize=10.5,color='#9A5A22',ha='center')
ax.text(18.5,470000,'Net value\n+$745k at 19',fontsize=10.5,color=NAVY,ha='center')
ax.set_ylim(0,1450000); ax.set_xticks(yos); ax.set_xlim(9.7,19.3)
ax.set_xlabel('Years of active service at the decision point',color=INK,fontsize=10.5)
ax.yaxis.set_major_formatter(k); ax.grid(axis='y',color=GRID); ax.set_axisbelow(True)
for s in ('top','right'): ax.spines[s].set_visible(False)
for s in ('left','bottom'): ax.spines[s].set_color('#9AA3AD')
ax.tick_params(colors=INK,labelsize=10,length=0)
ax.legend(loc='upper center',bbox_to_anchor=(0.5,-0.13),ncol=3,frameon=False,fontsize=9.5)
fig.text(0.06,0.055,r'Pension: \$48,000 BRS annuity (2% × 20 × \$120,000 High-3), 30 real payments, conditional on reaching 20; 3% ≈ Treasury real yields (Sept. 28, 2026).',fontsize=9,color=INK)
fig.text(0.06,0.022,r'Cash gap: \$459,057 civilian benchmark − \$282,585 Navy gross cash per year. Gross cash only. At 5% pension rate, break-even ≈ 16.1 years.',fontsize=9,color=INK)
fig.savefig('figure2.png',dpi=200,facecolor='white')
