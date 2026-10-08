"""Illustrative planning arithmetic, not a validated cluster-trial design or approved budget."""
from math import ceil, sqrt
from statistics import NormalDist

def trial_size(p0=.50, p1=.55, m=20, icc=.02, loss=.10):
    z=NormalDist().inv_cdf(.975); power=NormalDist().inv_cdf(.80)
    mean=(p0+p1)/2
    n=(z*sqrt(2*mean*(1-mean))+power*sqrt(p0*(1-p0)+p1*(1-p1)))**2/(p1-p0)**2
    de=1+(m-1)*icc
    commands=ceil(n*de/((1-loss)*m))
    return n, de, commands*2, commands*2*m

def main():
    for rho in (0,.01,.02,.05):
        n,de,k,total=trial_size(icc=rho)
        print(f'ICC {rho:.2f}: independent n/arm={n:.2f}; design effect={de:.2f}; commands={k}; invited={total}')
    setup=80*100+40*100+80*100
    per_offer=.5*60+.5*75+1.5*100+.5*100+.5*60
    per_person=.5*60
    screening=60*20+3000+6000
    feasibility=setup+screening+60*per_person+30*per_offer
    print(f'Setup={setup}; per enhanced offer={per_offer}; per enrolled person={per_person}; 60-person feasibility budget={feasibility}')
    n,de,k,total=trial_size()
    trial=setup+screening+total*per_person+(total/2)*per_offer
    additional=(total/2)*.9*.05
    print(f'Illustrative trial budget={trial}; expected additional retained={additional}; cost per additional retained={trial/additional:.2f}; replacement-cost threshold={4*trial/additional:.2f}')
    assert trial_size()[2:]==(240,4800)
    assert feasibility==40925
if __name__=='__main__': main()
