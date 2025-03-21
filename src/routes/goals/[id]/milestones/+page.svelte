<script lang="ts">
    export const prerender = false; // Disable prerendering
    import { loadData, saveData } from "$lib/storage";
    import Nav from "$lib/components/nav.svelte";
    import { onMount } from "svelte";
    import type {
        Goal,
        Task,
        Vision,
        Week,
        Milestone,
        Outcome,
    } from "$lib/types";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import {
        Button,
        Chart,
        NumberInput,
        Datepicker,
        Accordion,
        AccordionItem,
        Card,
        Table,
        TableHead,
        TableHeadCell,
        TableBody,
        TableBodyRow,
        TableBodyCell,
    } from "flowbite-svelte";
    import { CaretLeftSolid } from "flowbite-svelte-icons";
    import { extractWeeklyScores } from "$lib/utils/utils";
    let goalID: string = page.params.id;

    let data: Vision;

    let goal: Goal;
    let outcomes = [];

    onMount(async () => {
        // load total data from json file
        data = await loadData();

        // extract only one goal with the given id
        goal = data.goals.find((g) => g.id === goalID)!;

        //console.log(goal.outcomes);
        outcomes = goal.outcomes;

        //console.log("outcomes: ", outcomes);
        // for backwards compatibility, the original outcomes didn't have a field milestones
        outcomes.forEach((outcome) => {
            if (outcome.milestones == undefined) {
                outcome.milestones = [];
            }
        });

        // complete milestones
        goal.outcomes.forEach((k) => {
            k.milestones = completeMilestones(k.milestones);
        });

        // set chart to first outcome
        if (outcomes.length >= 1) {
            setupChart(outcomes[0].id);
        }

        getActionOptions();
        getWeekDates();
    });

    let currentOutcome: Outcome | null;

    function completeMilestones(milestones: Milestone[]): Milestone[] {
        const fullRange = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]
        const existingWeeks = new Set(milestones.map((m) => m.week));
        const missingWeeks = fullRange.filter(
            (week) => !existingWeeks.has(week),
        );

        const newMilestones = missingWeeks.map((week) => ({
            id: crypto.randomUUID(),
            week,
            value: 0,
        }));

        let constructedMilestones = [...milestones, ...newMilestones];
        [...constructedMilestones].sort((a, b) => a.week - b.week);

        return constructedMilestones;
    }

    async function updateData() {
        // replace the original goal with the updated goal
        data.goals = data.goals.map((g) => (g.id === goalID ? goal : g));

        await saveData(data);
        // go back to previous page
        history.back();
    }

    async function updateDataWithoutRedirect() {
        data.goals = data.goals.map((g) => (g.id === goalID ? goal : g));

        await saveData(data);
        if (currentOutcome) {
            setupChart(currentOutcome.id);
        }
    }
    /**
     * chart
     */

    function getActionOptions() {
        //console.log("action options ");
        // create series for the weekly goals.
        let weeklyScores = extractWeeklyScores(goal);

        let actionSeries = {
            name: "Weekly Score",
            data: weeklyScores.map((k) => k.percentage),
            color: "#FF7518",
        };

        actionOptions = {
            chart: {
                height: "100px",
                maxWidth: "100%",
                type: "area",
                fontFamily: "Inter, sans-serif",
                dropShadow: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            tooltip: {
                enabled: true,
                x: {
                    show: false,
                },
            },

            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 6,
            },
            grid: {
                show: false,
                strokeDashArray: 4,
                padding: {
                    left: 2,
                    right: 2,
                    top: 0,
                },
            },
            series: [actionSeries],
            xaxis: {
                categories: [],
                labels: {
                    show: true,
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            yaxis: {
                show: true,
            },
        };
    }

    let options = {};
    let actionOptions = {};

    function setupChart(outcomeID: string) {
        //console.log("setup chart function triggered");
        let outcome = goal.outcomes.find((o) => o.id === outcomeID)!;
        currentOutcome = outcome;
        // construct the chart options

        // construct target series
        let targetData = [];
        for (let i: number = 0; i < outcome.milestones.length; i++) {
            targetData.push(outcome.targetValue);
        }
        let targetSerie = {
            name: "Target",
            data: targetData,
            color: "#1A56DB",
        };

        let milestoneSerie = {
            name: "Milestones",
            data: outcome.milestones.map((m) => m.value),
            color: "#2E6F40",
        };

        // create series for the weekly goals.
        let weeklyScores = extractWeeklyScores(goal);

        let actionSeries = {
            name: "Actions",
            data: weeklyScores.map((k) => k.percentage),
            color: "#FF7518",
        };

        options = {
            chart: {
                height: "200px",
                maxWidth: "100%",
                type: "line",
                fontFamily: "Inter, sans-serif",
                dropShadow: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            tooltip: {
                enabled: true,
                x: {
                    show: false,
                },
            },

            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 6,
            },
            grid: {
                show: false,
                strokeDashArray: 4,
                padding: {
                    left: 2,
                    right: 2,
                    top: 0,
                },
            },
            series: [targetSerie, milestoneSerie],
            xaxis: {
                categories: [],
                labels: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            yaxis: {
                show: true,
            },
        };
    }

    // get the dates to show per week
    let weekDates: string[] = [];

    function getWeekDates() {
        weekDates = [];

        let startDate = new Date(goal.startDate);
        

        // Adjust to the previous Monday if not already on Monday
        const dayIndex = (startDate.getDay() + 6) % 7; // Monday=0, Sunday=6
        startDate.setDate(startDate.getDate() - dayIndex);

        

        // Generate 12 weeks
        for (let i = 0; i < 12; i++) {
            // Store Monday's date
            const monday = new Date(startDate);
            //console.log('monday: ',monday);

            // Move to Sunday (6 days later)
            startDate.setDate(startDate.getDate() + 6);
            const sunday = new Date(startDate);

            // Format the week range
            const weekRange = `${String(monday.getDate()).padStart(2,'0')}/${String(monday.getMonth()+1).padStart(2,'0')} - ${String(sunday.getDate()).padStart(2,'0')}/${String(sunday.getMonth()+1).padStart(2,'0')}`;
            weekDates.push(weekRange);

            // Move to next Monday
            startDate.setDate(startDate.getDate() + 1);
        }

        return weekDates; // Return the array if needed
    }
</script>

<Nav />
<main class="m-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
        Milestones
    </h1>
    <Button color="alternative" on:click={() => history.back()}
        ><CaretLeftSolid /> Back</Button
    >

    {#if goal}
        {#if goal.outcomes.length == 0}
            <div>No outcomes defined for this goal.</div>
        {/if}
        <div class="flex">
            <div class="w-1/2 p-3">
                <Accordion>
                    {#each goal.outcomes as outcome, idx}
                        <!-- add div wrapper, otherwise the on:click doesn't work on the header !-->
                        <div on:click={() => setupChart(outcome.id)}>
                            <AccordionItem>
                                <span slot="header"
                                    >{outcome.description} (target: {outcome.targetValue})</span
                                >
                                <div class="max-h-[220px] overflow-y-scroll">
                                    <Table>
                                        <TableHead>
                                            <TableHeadCell>Week</TableHeadCell>
                                            <TableHeadCell>Value</TableHeadCell>
                                        </TableHead>
                                        <TableBody>
                                            {#each outcome.milestones as milestone, idx}
                                                <TableBodyRow>
                                                    <TableBodyCell
                                                    class="w-1/2"
                                                        >W{milestone.week}<br/> ({weekDates[idx]})</TableBodyCell
                                                    >
                                                    <TableBodyCell
                                                        ><NumberInput
                                                            bind:value={
                                                                milestone.value
                                                            }
                                                            min="0"
                                                            on:change={updateDataWithoutRedirect}

                                                        ></NumberInput></TableBodyCell
                                                    >
                                                </TableBodyRow>
                                            {/each}
                                        </TableBody>
                                    </Table>
                                </div>
                            </AccordionItem>
                        </div>
                    {/each}
                </Accordion>
            </div>
            <div class="w-1/2 p-3">
                {#if goal.outcomes.length >= 1}
                    <Card>
                        {#if currentOutcome}
                            <h5
                                class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
                            >
                                {currentOutcome.description}
                            </h5>
                        {/if}
                        {#key JSON.stringify(options)}
                            <Chart {options} />
                        {/key}
                    </Card>
                {/if}
                <Card class="mt-3">
                    <h5
                        class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
                    >
                        Weekly Actions
                    </h5>

                    <Chart options={actionOptions} />
                </Card>
            </div>
        </div>

        <Button
            color="green"
            class="w-full"
            on:click={() => {
                updateData();
            }}>Update</Button
        >
    {/if}
</main>
