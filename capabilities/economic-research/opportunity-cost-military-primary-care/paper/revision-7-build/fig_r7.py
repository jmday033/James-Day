# Revision 7 figures. Figure 1: waterfall from gross cash to after-tax total
# compensation (Table 3). Figure 2: stay-to-20 break-even, gross vs after tax.
import json, matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
plt.rcParams['font.family']='DejaVu Sans'
INK='#1B2A38'; GRID='#E3E6EA'; STAY='#23628B'; LEAVE='#C98241'; TOT='#5B6770'
kfmt=FuncFormatter(lambda v,p:('−' if v<0 else '')+'$'+f'{abs(v)/1000:.0f}k')
def style(ax):
    ax.grid(axis='y',color=GRID); ax.set_axisbelow(True)
    for s in ('top','right'): ax.spines[s].set_visible(False)
    for s in ('left','bottom'): ax.spines[s].set_color('#9AA3AD')
    ax.tick_params(colors=INK,labelsize=10,length=0)

# ---------- Figure 1: waterfall ----------
steps=[('Gross cash\n(Figure 1A basis)',-662608,'total'),
       ('Taxes and\nbenefits',-56038-(-662608),'step'),
       ('Retiree\nTRICARE',6235-(-56038),'step'),
       ('No-income-tax\nresidence',100837-6235,'step'),
       ('Continuation\npay',117189-100837,'step'),
       ('5% lower pay\nafter 20',31453-117189,'step'),
       ('After tax and\nall adjustments',31453,'total')]
fig=plt.figure(figsize=(11,6.4),dpi=200)
fig.text(.06,.93,'After taxes, the cost of staying largely disappears',fontsize=18,fontweight='bold',color=INK)
fig.text(.06,.885,'Net value of staying to 20 at 10 years of service, O-4 internist, San Diego benchmark | present value, 2026 dollars',fontsize=10.5,color=INK)
ax=fig.add_axes([.10,.22,.86,.6]); style(ax)
run=0
for i,(lab,v,kind) in enumerate(steps):
    if kind=='total':
        ax.bar(i,v,.62,color=TOT); y=v
        ax.text(i,v+(-38000 if v<0 else 18000),('−' if v<0 else '+')+f'${abs(v)/1000:,.0f}k',ha='center',va='top' if v<0 else 'bottom',fontsize=11,fontweight='bold',color=INK)
        run=v
    else:
        bottom=run if v>0 else run+v
        ax.bar(i,abs(v),.62,bottom=bottom,color=STAY if v>0 else LEAVE)
        ax.text(i,max(run,run+v)+16000,('+' if v>0 else '−')+f'${abs(v)/1000:,.0f}k',ha='center',va='bottom',fontsize=10.5,color=INK)
        if i<len(steps)-1: pass
        ax.plot([i-.31-.38,i-.31],[run,run],color='#9AA3AD',lw=1) if i>0 else None
        run+=v
ax.plot([len(steps)-1-.69,len(steps)-1-.31],[run,run],color='#9AA3AD',lw=1)
ax.axhline(0,color=INK,lw=1)
ax.set_xticks(range(len(steps))); ax.set_xticklabels([s[0] for s in steps],fontsize=10,color=INK)
ax.yaxis.set_major_formatter(kfmt); ax.set_ylim(-760000,260000)
ax.text(6.45,120000,'Favors\nstaying',fontsize=9.5,color=STAY,ha='right')
ax.text(6.45,-150000,'Favors\nleaving',fontsize=9.5,color=LEAVE,ha='right')
fig.text(.06,.075,'Each bar adds one adjustment to the bar before it (Appendix A, Table 3). Blue steps favor staying; orange favors leaving. Pension at 3% real, pay at 5% real;',fontsize=9,color=INK)
fig.text(.06,.045,'federal and California taxes; retention bonus each year; averages from the companion calculator (Day, 2026). Illustrative, not an individual estimate.',fontsize=9,color=INK)
fig.savefig('figure2.png',dpi=200,facecolor='white'); plt.close(fig)

# ---------- Figure 2: break-even, gross vs after tax ----------
ann=lambda r,n: sum(1/(1+r)**t for t in range(1,n+1))
yos=list(range(10,20)); gap=459057-282585.33
gp=[48000*ann(.03,30)/1.03**(20-y) for y in yos]; gc=[gap*ann(.05,20-y) for y in yos]
d=json.load(open('fig7.json'))['afterTax']; ap=[p[1] for p in d['path']]; ac=[p[2] for p in d['path']]
def cross(p,c):
    for i in range(1,len(p)):
        a,b=p[i-1]-c[i-1],p[i]-c[i]
        if a<0<=b: return yos[i-1]+(-a)/(b-a)
fig=plt.figure(figsize=(11,6.4),dpi=200)
fig.text(.06,.93,'Taxes move the break-even from about 15 years to about 11',fontsize=18,fontweight='bold',color=INK)
fig.text(.06,.885,'Present value at each year of service of staying to 20 | pension at 3% real, pay at 5% real | 2026 dollars',fontsize=10.5,color=INK)
for j,(title,p,c) in enumerate([('A  Gross cash',gp,gc),('B  After taxes and benefits',ap,ac)]):
    ax=fig.add_axes([.08+.47*j,.22,.39,.56]); style(ax)
    ax.plot(yos,p,color=STAY,lw=2.6,marker='o',ms=5,label='Pension kept by staying')
    ax.plot(yos,c,color=LEAVE,lw=2.6,ls='--',marker='s',ms=5,label='Civilian advantage still to give up')
    x=cross(p,c)
    if x: ax.axvline(x,color='#7A8590',lw=1,ls=':'); ax.text(x+.2,1330000,f'Break-even ≈ {x:.1f} yrs',fontsize=11,color=INK)
    ax.set_ylim(0,1450000); ax.set_xticks(yos[::3]+[19]); ax.yaxis.set_major_formatter(FuncFormatter(lambda v,p:f'${v/1e6:.1f}M' if v>=1e6 else f'${v/1e3:.0f}k'))
    ax.set_xlabel('Years of service at the decision point',fontsize=10,color=INK)
    fig.text(.08+.47*j,.80,title,fontsize=12.5,fontweight='bold',color=INK)
    if j==0: ax.legend(loc='upper center',bbox_to_anchor=(1.08,-.16),ncol=2,frameon=False,fontsize=10.5)
fig.text(.06,.045,r'A: \$459,057 civilian benchmark − \$282,585 Navy gross cash per year; untaxed \$48,000 BRS pension (Table 2). B: same inputs after federal and',fontsize=9,color=INK)
fig.text(.06,.018,'California taxes and benefits; pension taxed at 32% (Table 3, row 2). Conditional on reaching 20 years.',fontsize=9,color=INK)
fig.savefig('figure1.png',dpi=200,facecolor='white'); plt.close(fig)
print('BE gross',cross(gp,gc),'after',cross(ap,ac))
